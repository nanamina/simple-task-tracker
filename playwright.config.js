// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * シンプルタスクトラッカー - Playwright設定
 * 
 * この設定ファイルは以下を提供します：
 * - 複数ブラウザでのテスト実行
 * - レスポンシブテスト用の複数デバイス設定
 * - 詳細なレポート生成
 * - スクリーンショット・動画記録
 * - 並列実行設定
 */

module.exports = defineConfig({
    // テストディレクトリ
    testDir: './playwright-tests',

    // 各テストのタイムアウト（30秒）
    timeout: 30 * 1000,

    // expect()のタイムアウト（5秒）
    expect: {
        timeout: 5000
    },

    // テスト実行設定
    fullyParallel: true, // 並列実行を有効化
    forbidOnly: !!process.env.CI, // CI環境では.only()を禁止
    retries: process.env.CI ? 2 : 0, // CI環境では失敗時に2回リトライ
    workers: process.env.CI ? 1 : undefined, // CI環境では1ワーカー、ローカルでは自動

    // レポート設定
    reporter: [
        ['html', { outputFolder: 'playwright-report' }], // HTMLレポート
        ['json', { outputFile: 'playwright-report/results.json' }], // JSONレポート
        ['junit', { outputFile: 'playwright-report/results.xml' }], // JUnitレポート
        ['list'] // コンソール出力
    ],

    // グローバル設定
    use: {
        // ベースURL（ローカルファイルの場合は使用しない）
        // baseURL: 'http://localhost:3000',

        // トレース設定（失敗時のみ記録）
        trace: 'on-first-retry',

        // スクリーンショット設定（失敗時のみ）
        screenshot: 'only-on-failure',

        // 動画記録設定（失敗時のみ）
        video: 'retain-on-failure',

        // ブラウザコンテキスト設定
        locale: 'ja-JP', // 日本語ロケール
        timezoneId: 'Asia/Tokyo', // 日本時間

        // アクセシビリティテスト用
        colorScheme: 'light',

        // ネットワーク設定
        ignoreHTTPSErrors: true,

        // ページ設定
        actionTimeout: 10000, // アクション（クリック等）のタイムアウト
        navigationTimeout: 30000, // ナビゲーションのタイムアウト
    },

    // プロジェクト設定（複数ブラウザ・デバイス）
    projects: [
        // デスクトップブラウザ
        {
            name: 'chromium-desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 720 }
            },
        },
        {
            name: 'firefox-desktop',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1280, height: 720 }
            },
        },
        {
            name: 'webkit-desktop',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1280, height: 720 }
            },
        },

        // モバイルデバイス
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
        },

        // タブレットデバイス
        {
            name: 'tablet-chrome',
            use: { ...devices['Galaxy Tab S4'] },
        },
        {
            name: 'tablet-safari',
            use: { ...devices['iPad Pro'] },
        },

        // アクセシビリティテスト用（高コントラスト）
        {
            name: 'accessibility-high-contrast',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'dark',
                reducedMotion: 'reduce',
                forcedColors: 'active',
            },
        },

        // パフォーマンステスト用（低速ネットワーク）
        {
            name: 'performance-slow-network',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: ['--simulate-slow-connection']
                }
            },
        },
    ],

    // ローカル開発サーバー設定（必要に応じて）
    webServer: process.env.CI ? undefined : {
        command: 'python -m http.server 8080',
        port: 8080,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },

    // グローバルセットアップ・ティアダウン
    globalSetup: require.resolve('./playwright-tests/global-setup.js'),
    globalTeardown: require.resolve('./playwright-tests/global-teardown.js'),
});