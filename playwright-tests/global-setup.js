// @ts-check

/**
 * Playwright グローバルセットアップ
 * 
 * テスト実行前の準備処理を行います：
 * - テスト環境の確認
 * - 必要なファイルの存在確認
 * - テストデータの準備
 */

const fs = require('fs');
const path = require('path');

async function globalSetup(config) {
    console.log('🚀 シンプルタスクトラッカー テスト環境をセットアップ中...');

    // 必要なファイルの存在確認
    const requiredFiles = [
        'simple-task-tracker-standalone.html',
        'simple-task-tracker.html',
        'task-tracker-styles.css',
        'task-tracker-script.js'
    ];

    const missingFiles = [];

    for (const file of requiredFiles) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file);
        }
    }

    if (missingFiles.length > 0) {
        console.error('❌ 必要なファイルが見つかりません:');
        missingFiles.forEach(file => console.error(`   - ${file}`));
        throw new Error('テストに必要なファイルが不足しています');
    }

    // テストレポートディレクトリの作成
    const reportDir = path.join(process.cwd(), 'playwright-report');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
        console.log('📁 テストレポートディレクトリを作成しました');
    }

    // テスト結果ディレクトリの作成
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
        console.log('📁 テスト結果ディレクトリを作成しました');
    }

    // テスト開始時刻を記録
    const startTime = new Date().toISOString();
    const testInfo = {
        startTime,
        environment: {
            node: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd()
        },
        files: requiredFiles.map(file => ({
            name: file,
            exists: true,
            size: fs.statSync(path.join(process.cwd(), file)).size
        }))
    };

    // テスト情報をファイルに保存
    fs.writeFileSync(
        path.join(reportDir, 'test-info.json'),
        JSON.stringify(testInfo, null, 2)
    );

    console.log('✅ テスト環境のセットアップが完了しました');
    console.log(`📊 テスト開始時刻: ${startTime}`);
    console.log(`🗂️  テストファイル数: ${requiredFiles.length}`);

    return testInfo;
}

module.exports = globalSetup;