# Simple Task Tracker - AWS CDK

このディレクトリには、Simple Task TrackerをAWSにデプロイするためのAWS CDKコードが含まれています。

## 🏗️ アーキテクチャ

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│       S3         │    │   Route53       │
│   Distribution  │    │     Bucket       │    │   (Optional)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│      HTTPS      │    │  Static Files    │    │ Custom Domain   │
│   SSL/TLS       │    │   - HTML         │    │   (Optional)    │
│   Certificate   │    │   - CSS          │    │                 │
│   (ACM)         │    │   - JavaScript   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 主要コンポーネント

- **Amazon S3**: 静的ファイルのホスティング
- **Amazon CloudFront**: CDN、SSL終端、キャッシュ
- **AWS Certificate Manager**: SSL証明書の管理
- **Amazon Route53**: DNS管理（カスタムドメイン使用時）
- **Origin Access Control (OAC)**: S3への安全なアクセス制御

## 🚀 デプロイ手順

### 1. 前提条件

```bash
# AWS CLIの設定
aws configure

# Node.jsとnpmのインストール確認
node --version  # v16以上
npm --version

# AWS CDKのインストール
npm install -g aws-cdk
```

### 2. 依存関係のインストール

```bash
cd cdk
npm install
```

### 3. CDKブートストラップ（初回のみ）

```bash
# デフォルトリージョン（東京）でブートストラップ
cdk bootstrap

# 特定のリージョンでブートストラップ
cdk bootstrap aws://ACCOUNT-NUMBER/ap-northeast-1
```

### 4. デプロイ

#### 基本デプロイ（CloudFrontドメインを使用）

```bash
# 設定確認
cdk diff

# デプロイ実行
cdk deploy

# 自動承認でデプロイ
cdk deploy --require-approval never
```

#### カスタムドメインでのデプロイ

```bash
# 環境変数でドメイン設定
export DOMAIN_NAME="task-tracker.example.com"
export HOSTED_ZONE_ID="Z1234567890ABC"

# デプロイ
cdk deploy -c domainName=$DOMAIN_NAME -c hostedZoneId=$HOSTED_ZONE_ID
```

#### 環境別デプロイ

```bash
# 開発環境
cdk deploy -c environment=development

# ステージング環境
cdk deploy -c environment=staging

# 本番環境（デフォルト）
cdk deploy -c environment=production
```

## 🔧 設定オプション

### コンテキスト変数

CDKデプロイ時に以下のコンテキスト変数を指定できます：

```bash
# カスタムドメイン名
-c domainName="your-domain.com"

# Route53ホストゾーンID
-c hostedZoneId="Z1234567890ABC"

# 環境名
-c environment="production"
```

### 環境変数

```bash
# AWSアカウントID（自動検出）
export CDK_DEFAULT_ACCOUNT="123456789012"

# AWSリージョン
export CDK_DEFAULT_REGION="ap-northeast-1"

# 環境名
export ENVIRONMENT="production"
```

## 📊 コスト見積もり

### 月間コスト概算（東京リージョン）

| サービス | 使用量 | 月額コスト（USD） |
|----------|--------|------------------|
| S3 Standard | 1GB | $0.025 |
| CloudFront | 10GB転送 | $0.85 |
| Route53 | 1ホストゾーン | $0.50 |
| ACM | SSL証明書 | 無料 |
| **合計** | | **約$1.38** |

※ 実際のコストは使用量により変動します

## 🛠️ 運用コマンド

### デプロイ関連

```bash
# スタック情報確認
cdk list

# 差分確認
cdk diff

# CloudFormationテンプレート生成
cdk synth

# デプロイ
cdk deploy

# 削除
cdk destroy
```

### テスト実行

```bash
# ユニットテスト実行
npm test

# テスト監視モード
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

### ビルド

```bash
# TypeScriptコンパイル
npm run build

# 監視モード
npm run watch
```

## 🔒 セキュリティ設定

### 実装済みセキュリティ機能

- ✅ **HTTPS強制**: すべてのHTTPリクエストをHTTPSにリダイレクト
- ✅ **Origin Access Control**: S3への直接アクセスを防止
- ✅ **セキュリティヘッダー**: XSS、CSRF等の攻撃を防止
- ✅ **SSL/TLS**: 最新のTLS 1.2以上を使用
- ✅ **S3暗号化**: サーバーサイド暗号化を有効化
- ✅ **パブリックアクセス無効**: S3バケットへの直接アクセスを禁止

### セキュリティヘッダー

CloudFrontで自動的に以下のヘッダーが追加されます：

```
Strict-Transport-Security: max-age=63072000; includeSubdomains; preload
Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

## 📈 監視とログ

### CloudWatch メトリクス

以下のメトリクスが自動的に収集されます：

- **CloudFront**:
  - リクエスト数
  - データ転送量
  - エラー率（4xx, 5xx）
  - キャッシュヒット率

- **S3**:
  - リクエスト数
  - ストレージ使用量
  - データ転送量

### ログ設定

本番環境では以下のログが有効化されます：

- **CloudFrontアクセスログ**: S3バケットに保存（90日間保持）
- **S3アクセスログ**: 必要に応じて有効化可能

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. デプロイエラー

```bash
# エラー: "CDK not bootstrapped"
cdk bootstrap

# エラー: "Insufficient permissions"
aws sts get-caller-identity  # 権限確認
```

#### 2. ドメイン設定エラー

```bash
# DNS設定確認
nslookup your-domain.com

# Route53設定確認
aws route53 list-hosted-zones
```

#### 3. SSL証明書エラー

```bash
# 証明書状態確認
aws acm list-certificates --region us-east-1
```

#### 4. CloudFrontキャッシュ問題

```bash
# キャッシュ無効化
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### ログ確認

```bash
# CloudFormationイベント確認
aws cloudformation describe-stack-events \
  --stack-name SimpleTaskTrackerStack

# CloudFrontディストリビューション確認
aws cloudfront list-distributions
```

## 🔄 CI/CD統合

### GitHub Actions例

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd cdk
          npm ci
      
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          cd cdk
          cdk deploy --require-approval never
```

## 📚 参考資料

- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/)
- [Amazon CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [Amazon S3 User Guide](https://docs.aws.amazon.com/s3/)
- [AWS Certificate Manager User Guide](https://docs.aws.amazon.com/acm/)

## 🤝 サポート

問題が発生した場合は、以下の情報を含めてお問い合わせください：

- CDKバージョン: `cdk --version`
- Node.jsバージョン: `node --version`
- AWSリージョン
- エラーメッセージ
- 実行したコマンド