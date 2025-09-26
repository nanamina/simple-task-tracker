# シンプルタスクトラッカー プロジェクト

このプロジェクトには、シンプルタスクトラッカーアプリケーションの関連ファイルのみが含まれています。

## ファイル構成

### メインファイル
- `simple-task-tracker-standalone.html` - **推奨**: 単一ファイル版（HTML、CSS、JavaScript統合）
- `README-simple-task-tracker.md` - 詳細な使用方法とセットアップ手順

### 分離版ファイル（開発用）
- `simple-task-tracker.html` - HTML構造
- `task-tracker-styles.css` - CSSスタイル
- `task-tracker-script.js` - JavaScript機能

### AWS デプロイメント
- `cdk/` - AWS CDK インフラストラクチャコード
- `deploy-aws.sh` - AWS デプロイスクリプト
- `DEPLOYMENT.md` - AWS デプロイガイド

### CI/CD パイプライン
- `.github/workflows/` - GitHub Actions ワークフロー
- `README-CICD.md` - CI/CD パイプライン詳細ガイド
- `setup-cicd.sh` - CI/CD セットアップスクリプト

### テスト
- `playwright-tests/` - Playwright E2E テスト
- `simple-task-tracker.test.js` - ユニットテスト
- `run-tests.js` - テスト実行スクリプト
- `playwright.config.js` - Playwright 設定

### プロジェクト管理
- `.kiro/` - Kiro設定とスペック
- `.gitignore` - Git除外設定

### バックアップ
- `bkup/` - 元のプロジェクトファイル（Task Management System関連）

## 使用方法

### 🚀 簡単な使用方法
1. `simple-task-tracker-standalone.html` をブラウザで開く
2. すぐに使用開始！

### 📚 詳細ガイド
- **アプリ使用方法**: `README-simple-task-tracker.md`
- **AWS デプロイ**: `DEPLOYMENT.md`
- **GitHub Actions CI/CD**: `README-CICD.md`
- **AWS CodeBuild CI/CD**: `README-AWS-CICD.md`

### ☁️ AWS デプロイ
```bash
# 簡単デプロイ
./deploy-aws.sh

# カスタムドメインでデプロイ
./deploy-aws.sh -d your-domain.com -z YOUR_HOSTED_ZONE_ID
```

### 🔄 CI/CD セットアップ

#### GitHub Actions (推奨: 簡単セットアップ)
```bash
# GitHub Actions パイプラインセットアップ
./setup-cicd.sh

# 設定検証
./setup-cicd.sh validate

# ローカルテスト実行
./setup-cicd.sh test
```

#### AWS CodeBuild/CodePipeline (推奨: AWS ネイティブ)
```bash
# AWS CI/CD パイプラインセットアップ
./setup-aws-cicd.sh setup -o YOUR_GITHUB_USERNAME

# GitHub準備
./setup-aws-cicd.sh github

# 設定検証
./setup-aws-cicd.sh validate
```

### 🧪 テスト実行
```bash
# 全テスト実行
npm test

# UI テスト
npm run test:ui

# アクセシビリティテスト
npm run test:accessibility
```

## バックアップについて

`bkup/` フォルダには、元のTask Management Systemプロジェクトの全ファイルが保存されています：
- Node.js/Express サーバーコード
- React フロントエンドコード
- データベース設定
- デプロイメント設定
- テストファイル
- その他の開発関連ファイル

必要に応じて、これらのファイルを元の場所に戻すことができます。