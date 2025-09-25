#!/bin/bash

# Simple Task Tracker - AWS デプロイスクリプト
# このスクリプトはSimple Task TrackerをAWSにデプロイします

set -e  # エラー時に停止

# 色付きログ出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ヘルプ表示
show_help() {
    cat << EOF
Simple Task Tracker - AWS デプロイスクリプト

使用方法:
    $0 [オプション]

オプション:
    -h, --help              このヘルプを表示
    -e, --environment ENV   環境名を指定 (dev, staging, production)
    -d, --domain DOMAIN     カスタムドメイン名を指定
    -z, --zone-id ID        Route53ホストゾーンIDを指定
    -r, --region REGION     AWSリージョンを指定 (デフォルト: ap-northeast-1)
    -p, --profile PROFILE   AWSプロファイルを指定
    --dry-run              実際のデプロイは行わず、差分のみ表示
    --destroy              スタックを削除
    --bootstrap            CDKブートストラップを実行

例:
    # 基本デプロイ
    $0

    # カスタムドメインでデプロイ
    $0 -d task-tracker.example.com -z Z1234567890ABC

    # 開発環境にデプロイ
    $0 -e dev

    # 差分確認のみ
    $0 --dry-run

    # スタック削除
    $0 --destroy
EOF
}

# デフォルト値
ENVIRONMENT="production"
REGION="ap-northeast-1"
DRY_RUN=false
DESTROY=false
BOOTSTRAP=false
DOMAIN_NAME=""
HOSTED_ZONE_ID=""
AWS_PROFILE=""

# コマンドライン引数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -z|--zone-id)
            HOSTED_ZONE_ID="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -p|--profile)
            AWS_PROFILE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --destroy)
            DESTROY=true
            shift
            ;;
        --bootstrap)
            BOOTSTRAP=true
            shift
            ;;
        *)
            log_error "不明なオプション: $1"
            show_help
            exit 1
            ;;
    esac
done

# 環境変数設定
export CDK_DEFAULT_REGION="$REGION"
if [[ -n "$AWS_PROFILE" ]]; then
    export AWS_PROFILE="$AWS_PROFILE"
fi

# 前提条件チェック
check_prerequisites() {
    log_info "前提条件をチェック中..."

    # Node.js確認
    if ! command -v node &> /dev/null; then
        log_error "Node.jsがインストールされていません"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 16 ]]; then
        log_error "Node.js v16以上が必要です (現在: $(node --version))"
        exit 1
    fi
    log_success "Node.js: $(node --version)"

    # AWS CLI確認
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLIがインストールされていません"
        exit 1
    fi
    log_success "AWS CLI: $(aws --version)"

    # AWS認証確認
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS認証が設定されていません"
        log_info "以下のコマンドで設定してください: aws configure"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    CURRENT_REGION=$(aws configure get region || echo "未設定")
    log_success "AWS Account: $ACCOUNT_ID"
    log_success "AWS Region: $CURRENT_REGION"

    # CDK確認
    if ! command -v cdk &> /dev/null; then
        log_warning "AWS CDKがインストールされていません。インストール中..."
        npm install -g aws-cdk
    fi
    log_success "AWS CDK: $(cdk --version)"

    # ファイル存在確認
    if [[ ! -f "simple-task-tracker-standalone.html" ]]; then
        log_error "simple-task-tracker-standalone.html が見つかりません"
        exit 1
    fi
    log_success "デプロイファイル確認完了"
}

# CDKディレクトリセットアップ
setup_cdk() {
    log_info "CDK環境をセットアップ中..."
    
    cd cdk
    
    # 依存関係インストール
    if [[ ! -d "node_modules" ]]; then
        log_info "依存関係をインストール中..."
        npm install
    fi
    
    # TypeScriptコンパイル
    log_info "TypeScriptをコンパイル中..."
    npm run build
    
    log_success "CDK環境セットアップ完了"
}

# CDKブートストラップ
bootstrap_cdk() {
    log_info "CDKブートストラップを実行中..."
    
    # ブートストラップ状況確認
    BOOTSTRAP_STACK="CDKToolkit"
    if aws cloudformation describe-stacks --stack-name $BOOTSTRAP_STACK --region $REGION &> /dev/null; then
        log_success "CDKブートストラップは既に完了しています"
    else
        log_info "CDKブートストラップを実行します..."
        cdk bootstrap aws://$ACCOUNT_ID/$REGION
        log_success "CDKブートストラップ完了"
    fi
}

# デプロイ実行
deploy_stack() {
    log_info "Simple Task Trackerをデプロイ中..."
    
    # CDKコマンド構築
    CDK_CMD="cdk"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        CDK_CMD="$CDK_CMD diff"
        log_info "差分確認モード（実際のデプロイは行いません）"
    elif [[ "$DESTROY" == "true" ]]; then
        CDK_CMD="$CDK_CMD destroy"
        log_warning "スタック削除モード"
    else
        CDK_CMD="$CDK_CMD deploy --require-approval never"
    fi
    
    # コンテキスト変数追加
    if [[ -n "$DOMAIN_NAME" ]]; then
        CDK_CMD="$CDK_CMD -c domainName=$DOMAIN_NAME"
        log_info "カスタムドメイン: $DOMAIN_NAME"
    fi
    
    if [[ -n "$HOSTED_ZONE_ID" ]]; then
        CDK_CMD="$CDK_CMD -c hostedZoneId=$HOSTED_ZONE_ID"
        log_info "ホストゾーンID: $HOSTED_ZONE_ID"
    fi
    
    CDK_CMD="$CDK_CMD -c environment=$ENVIRONMENT"
    log_info "環境: $ENVIRONMENT"
    
    # デプロイ実行
    log_info "実行コマンド: $CDK_CMD"
    
    if [[ "$DESTROY" == "true" ]]; then
        read -p "本当にスタックを削除しますか？ (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "削除をキャンセルしました"
            exit 0
        fi
    fi
    
    eval $CDK_CMD
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_success "差分確認完了"
    elif [[ "$DESTROY" == "true" ]]; then
        log_success "スタック削除完了"
    else
        log_success "デプロイ完了"
        
        # 出力情報表示
        log_info "デプロイ情報を取得中..."
        STACK_NAME="SimpleTaskTrackerStack"
        
        # CloudFormation出力取得
        WEBSITE_URL=$(aws cloudformation describe-stacks \
            --stack-name $STACK_NAME \
            --region $REGION \
            --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
            --output text 2>/dev/null || echo "取得失敗")
        
        DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
            --stack-name $STACK_NAME \
            --region $REGION \
            --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
            --output text 2>/dev/null || echo "取得失敗")
        
        echo
        log_success "🎉 Simple Task Tracker デプロイ完了！"
        echo
        echo "📊 デプロイ情報:"
        echo "  🌐 Website URL: $WEBSITE_URL"
        echo "  🔗 Distribution ID: $DISTRIBUTION_ID"
        echo "  🌍 Region: $REGION"
        echo "  🏷️  Environment: $ENVIRONMENT"
        echo
        
        if [[ -n "$DOMAIN_NAME" ]]; then
            echo "  🔗 Custom Domain: https://$DOMAIN_NAME"
            echo
            log_info "DNS設定が反映されるまで数分かかる場合があります"
        fi
        
        log_info "CloudFrontの配布が完了するまで数分かかる場合があります"
        echo
    fi
}

# メイン実行
main() {
    echo "🚀 Simple Task Tracker - AWS デプロイスクリプト"
    echo "=================================================="
    echo
    
    # 前提条件チェック
    check_prerequisites
    echo
    
    # CDKセットアップ
    setup_cdk
    echo
    
    # ブートストラップ（必要時または明示的指定時）
    if [[ "$BOOTSTRAP" == "true" ]] || ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION &> /dev/null; then
        bootstrap_cdk
        echo
    fi
    
    # デプロイ実行
    deploy_stack
    
    cd ..
}

# スクリプト実行
main "$@"