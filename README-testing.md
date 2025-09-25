# シンプルタスクトラッカー - 自動テストガイド

このドキュメントでは、MCPのPlaywrightを使用したシンプルタスクトラッカーの自動テスト実行方法について説明します。

## 📋 目次

- [セットアップ](#セットアップ)
- [テスト実行](#テスト実行)
- [テストカテゴリ](#テストカテゴリ)
- [ブラウザ・デバイステスト](#ブラウザデバイステスト)
- [レポート確認](#レポート確認)
- [デバッグ](#デバッグ)
- [CI/CD統合](#cicd統合)
- [トラブルシューティング](#トラブルシューティング)

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
# Node.jsの依存関係をインストール
npm install

# Playwrightブラウザをインストール
npm run test:install
```

### 2. ファイル構成の確認

以下のファイルが存在することを確認してください：

```
├── simple-task-tracker-standalone.html  # メインアプリケーション
├── simple-task-tracker.html            # 分離版HTML
├── task-tracker-styles.css             # 分離版CSS
├── task-tracker-script.js              # 分離版JavaScript
├── playwright-tests/                   # テストファイル
│   ├── simple-task-tracker.spec.js     # メインテストスイート
│   ├── global-setup.js                 # グローバルセットアップ
│   └── global-teardown.js              # グローバルティアダウン
├── playwright.config.js                # Playwright設定
├── run-tests.js                        # テスト実行スクリプト
└── package.json                        # プロジェクト設定
```

## 🧪 テスト実行

### 基本的なテスト実行

```bash
# すべてのテストを実行
npm test

# または
node run-tests.js all
```

### カテゴリ別テスト実行

```bash
# 単体テスト
npm run test:unit

# 統合テスト
npm run test:integration

# UIテスト
npm run test:ui

# アクセシビリティテスト
npm run test:accessibility
```

### ブラウザ別テスト実行

```bash
# Chrome系ブラウザのみ
npm run test:chrome

# Firefox系ブラウザのみ
npm run test:firefox

# Safari系ブラウザのみ
npm run test:safari
```

### デバイス別テスト実行

```bash
# モバイルデバイス
npm run test:mobile

# デスクトップ
npm run test:desktop
```

## 📊 テストカテゴリ

### 1. 基本機能テスト
- ページ読み込み確認
- タスクの追加・削除・完了
- 複数タスクの管理
- Enterキーでの操作

### 2. 入力バリデーションテスト
- 空入力のエラーハンドリング
- 文字数制限の確認
- 重複タスクの検出
- リアルタイム文字数カウント

### 3. IME入力対応テスト
- 日本語入力中のEnterキー処理
- compositionイベントの正しい処理
- かな変換の適切な動作

### 4. データ永続化テスト
- LocalStorageへの保存
- ページリロード後の復元
- 完了状態の永続化

### 5. UIアニメーションテスト
- タスク追加時のアニメーション
- タスク削除時のアニメーション
- ホバー効果の確認

### 6. レスポンシブデザインテスト
- モバイル表示の確認
- タブレット表示の確認
- デスクトップ表示の確認

### 7. アクセシビリティテスト
- ARIA属性の確認
- キーボードナビゲーション
- スクリーンリーダー対応
- フォーカス表示

### 8. エラーハンドリングテスト
- LocalStorage無効時の対応
- ネットワークエラー時の動作
- JavaScript無効時の表示

### 9. パフォーマンステスト
- 大量タスクでの動作確認
- ページ読み込み時間の測定

## 🖥️ ブラウザ・デバイステスト

### 対応ブラウザ
- **Chromium** (Chrome, Edge)
- **Firefox**
- **WebKit** (Safari)

### 対応デバイス
- **デスクトップ**: 1280x720
- **モバイル**: Pixel 5, iPhone 12
- **タブレット**: Galaxy Tab S4, iPad Pro

### 特殊設定
- **高コントラスト**: アクセシビリティテスト用
- **低速ネットワーク**: パフォーマンステスト用

## 📈 レポート確認

### HTMLレポートの表示

```bash
# テスト実行後にレポートを表示
npm run test:report

# または
node run-tests.js report
```

### レポートファイルの場所

```
playwright-report/
├── index.html          # メインレポート
├── results.json        # JSON形式の結果
├── results.xml         # JUnit形式の結果
├── summary.md          # マークダウンサマリー
└── test-info.json      # テスト実行情報
```

### レポートの内容
- テスト結果の詳細
- 失敗したテストのスクリーンショット
- 実行時間の分析
- ブラウザ別の結果比較

## 🐛 デバッグ

### ヘッド付きモードでの実行

```bash
# ブラウザを表示してテスト実行
npm run test:headed
```

### デバッグモードでの実行

```bash
# Playwright Inspectorを使用
npm run test:debug
```

### 個別テストの実行

```bash
# 特定のテストのみ実行
npx playwright test --grep "タスクを追加できる"

# 特定のファイルのみ実行
npx playwright test playwright-tests/simple-task-tracker.spec.js
```

### コード生成

```bash
# 操作を記録してテストコードを生成
npm run playwright:codegen
```

## 🔄 CI/CD統合

### GitHub Actions設定例

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### 環境変数

```bash
# CI環境での実行
CI=true npm test

# 並列実行数の制御
PLAYWRIGHT_WORKERS=2 npm test

# タイムアウトの調整
PLAYWRIGHT_TIMEOUT=60000 npm test
```

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 1. ブラウザが見つからない

```bash
# ブラウザを再インストール
npx playwright install
```

#### 2. テストがタイムアウトする

```bash
# タイムアウトを延長
npx playwright test --timeout=60000
```

#### 3. ファイルが見つからない

```bash
# ファイルパスを確認
ls -la simple-task-tracker-standalone.html
```

#### 4. 権限エラー

```bash
# 実行権限を付与
chmod +x run-tests.js
```

### ログの確認

```bash
# 詳細ログを表示
DEBUG=pw:api npm test

# ブラウザログを表示
npx playwright test --reporter=line
```

### テスト結果のクリーンアップ

```bash
# テスト結果をクリーンアップ
npm run test:clean
```

## 📝 カスタムテストの追加

### 新しいテストの作成

1. `playwright-tests/` ディレクトリに新しい `.spec.js` ファイルを作成
2. 以下のテンプレートを使用：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('新しい機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + process.cwd() + '/simple-task-tracker-standalone.html');
  });

  test('新しいテストケース', async ({ page }) => {
    // テストコードをここに記述
    await expect(page.locator('.app-title')).toBeVisible();
  });
});
```

### テスト設定のカスタマイズ

`playwright.config.js` を編集して以下をカスタマイズできます：

- タイムアウト設定
- ブラウザ設定
- レポート形式
- 並列実行数

## 🎯 ベストプラクティス

### 1. テストの構造化
- 機能ごとにテストを分類
- 明確なテスト名を使用
- セットアップとクリーンアップを適切に実装

### 2. 安定したテスト
- 適切な待機処理を使用
- 動的要素の確実な特定
- フレーキーテストの回避

### 3. 効率的な実行
- 並列実行の活用
- 必要なテストのみの実行
- 適切なタイムアウト設定

### 4. メンテナンス
- 定期的なテストの見直し
- 不要なテストの削除
- テストデータの管理

## 📞 サポート

### 問題報告
- テスト失敗時はスクリーンショットを確認
- エラーログを含めて報告
- 再現手順を明確に記載

### 参考資料
- [Playwright公式ドキュメント](https://playwright.dev/)
- [テストベストプラクティス](https://playwright.dev/docs/best-practices)
- [アクセシビリティテスト](https://playwright.dev/docs/accessibility-testing)

---

**シンプルタスクトラッカー テストスイート** - 品質を保証する包括的な自動テスト 🧪✨