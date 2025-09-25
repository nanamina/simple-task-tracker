// @ts-check

/**
 * Playwright グローバルティアダウン
 * 
 * テスト実行後のクリーンアップ処理を行います：
 * - テスト結果の集計
 * - 一時ファイルのクリーンアップ
 * - レポートの生成
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
    console.log('🧹 テスト環境をクリーンアップ中...');

    const reportDir = path.join(process.cwd(), 'playwright-report');
    const testInfoPath = path.join(reportDir, 'test-info.json');

    // テスト情報を読み込み
    let testInfo = {};
    if (fs.existsSync(testInfoPath)) {
        testInfo = JSON.parse(fs.readFileSync(testInfoPath, 'utf8'));
    }

    // テスト終了時刻を記録
    const endTime = new Date().toISOString();
    testInfo.endTime = endTime;

    // 実行時間を計算
    if (testInfo.startTime) {
        const startMs = new Date(testInfo.startTime).getTime();
        const endMs = new Date(endTime).getTime();
        testInfo.duration = endMs - startMs;
        testInfo.durationFormatted = formatDuration(testInfo.duration);
    }

    // テスト結果ファイルの確認
    const resultsJsonPath = path.join(reportDir, 'results.json');
    if (fs.existsSync(resultsJsonPath)) {
        try {
            const results = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
            testInfo.results = {
                totalTests: results.suites?.reduce((total, suite) => {
                    return total + (suite.specs?.length || 0);
                }, 0) || 0,
                passed: 0,
                failed: 0,
                skipped: 0
            };

            // 結果を集計
            if (results.suites) {
                results.suites.forEach(suite => {
                    if (suite.specs) {
                        suite.specs.forEach(spec => {
                            if (spec.tests) {
                                spec.tests.forEach(test => {
                                    if (test.results) {
                                        test.results.forEach(result => {
                                            switch (result.status) {
                                                case 'passed':
                                                    testInfo.results.passed++;
                                                    break;
                                                case 'failed':
                                                    testInfo.results.failed++;
                                                    break;
                                                case 'skipped':
                                                    testInfo.results.skipped++;
                                                    break;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.warn('⚠️  テスト結果の解析に失敗しました:', error.message);
        }
    }

    // 更新されたテスト情報を保存
    fs.writeFileSync(testInfoPath, JSON.stringify(testInfo, null, 2));

    // サマリーレポートを生成
    generateSummaryReport(testInfo, reportDir);

    // 一時ファイルのクリーンアップ（オプション）
    cleanupTempFiles();

    // 結果を表示
    console.log('✅ テスト実行が完了しました');
    console.log(`📊 テスト終了時刻: ${endTime}`);

    if (testInfo.duration) {
        console.log(`⏱️  実行時間: ${testInfo.durationFormatted}`);
    }

    if (testInfo.results) {
        console.log(`📈 テスト結果:`);
        console.log(`   ✅ 成功: ${testInfo.results.passed}`);
        console.log(`   ❌ 失敗: ${testInfo.results.failed}`);
        console.log(`   ⏭️  スキップ: ${testInfo.results.skipped}`);
        console.log(`   📊 合計: ${testInfo.results.totalTests}`);
    }

    console.log(`📁 詳細レポート: ${path.relative(process.cwd(), reportDir)}/index.html`);
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}時間${minutes % 60}分${seconds % 60}秒`;
    } else if (minutes > 0) {
        return `${minutes}分${seconds % 60}秒`;
    } else {
        return `${seconds}秒`;
    }
}

function generateSummaryReport(testInfo, reportDir) {
    const summaryPath = path.join(reportDir, 'summary.md');

    let summary = `# シンプルタスクトラッカー テスト結果サマリー\n\n`;
    summary += `## 実行情報\n\n`;
    summary += `- **開始時刻**: ${testInfo.startTime || 'N/A'}\n`;
    summary += `- **終了時刻**: ${testInfo.endTime || 'N/A'}\n`;
    summary += `- **実行時間**: ${testInfo.durationFormatted || 'N/A'}\n`;
    summary += `- **プラットフォーム**: ${testInfo.environment?.platform || 'N/A'}\n`;
    summary += `- **Node.js**: ${testInfo.environment?.node || 'N/A'}\n\n`;

    if (testInfo.results) {
        summary += `## テスト結果\n\n`;
        summary += `| 項目 | 件数 |\n`;
        summary += `|------|------|\n`;
        summary += `| ✅ 成功 | ${testInfo.results.passed} |\n`;
        summary += `| ❌ 失敗 | ${testInfo.results.failed} |\n`;
        summary += `| ⏭️ スキップ | ${testInfo.results.skipped} |\n`;
        summary += `| 📊 合計 | ${testInfo.results.totalTests} |\n\n`;

        const successRate = testInfo.results.totalTests > 0
            ? ((testInfo.results.passed / testInfo.results.totalTests) * 100).toFixed(1)
            : '0';
        summary += `**成功率**: ${successRate}%\n\n`;
    }

    summary += `## ファイル情報\n\n`;
    if (testInfo.files) {
        testInfo.files.forEach(file => {
            summary += `- **${file.name}**: ${(file.size / 1024).toFixed(1)} KB\n`;
        });
    }

    summary += `\n## レポートファイル\n\n`;
    summary += `- [HTMLレポート](./index.html)\n`;
    summary += `- [JSONレポート](./results.json)\n`;
    summary += `- [JUnitレポート](./results.xml)\n`;

    summary += `\n---\n`;
    summary += `*Generated at ${new Date().toISOString()}*\n`;

    fs.writeFileSync(summaryPath, summary);
    console.log('📄 サマリーレポートを生成しました: summary.md');
}

function cleanupTempFiles() {
    // 一時ファイルのクリーンアップ（必要に応じて）
    const tempDirs = [
        path.join(process.cwd(), 'test-results', 'temp'),
        path.join(process.cwd(), '.playwright-cache')
    ];

    tempDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
                console.log(`🗑️  一時ディレクトリを削除しました: ${path.relative(process.cwd(), dir)}`);
            } catch (error) {
                console.warn(`⚠️  一時ディレクトリの削除に失敗しました: ${dir}`, error.message);
            }
        }
    });
}

module.exports = globalTeardown;