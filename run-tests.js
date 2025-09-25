#!/usr/bin/env node

/**
 * シンプルタスクトラッカー テスト実行スクリプト
 * 
 * このスクリプトは以下の機能を提供します：
 * - 各種テストの実行
 * - テスト結果の表示
 * - レポート生成
 * - CI/CD統合
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const command = args[0] || 'help';

// 利用可能なコマンド
const commands = {
    'all': 'すべてのテストを実行',
    'unit': '単体テストのみ実行',
    'integration': '統合テストのみ実行',
    'ui': 'UIテストのみ実行',
    'accessibility': 'アクセシビリティテストのみ実行',
    'mobile': 'モバイルテストのみ実行',
    'desktop': 'デスクトップテストのみ実行',
    'chrome': 'Chromeブラウザのみでテスト',
    'firefox': 'Firefoxブラウザのみでテスト',
    'safari': 'Safariブラウザのみでテスト',
    'headed': 'ブラウザを表示してテスト実行',
    'debug': 'デバッグモードでテスト実行',
    'report': 'テストレポートを表示',
    'clean': 'テスト結果をクリーンアップ',
    'install': 'Playwrightブラウザをインストール',
    'help': 'ヘルプを表示'
};

// メイン実行関数
async function main() {
    console.log('🧪 シンプルタスクトラッカー テストランナー\n');

    try {
        switch (command) {
            case 'all':
                await runAllTests();
                break;
            case 'unit':
                await runTestsByGrep('単体テスト|Unit Tests');
                break;
            case 'integration':
                await runTestsByGrep('統合テスト|Integration Tests');
                break;
            case 'ui':
                await runTestsByGrep('UIテスト|User Interface Tests');
                break;
            case 'accessibility':
                await runTestsByGrep('アクセシビリティテスト|Accessibility Tests');
                break;
            case 'mobile':
                await runTestsByProject('mobile-chrome', 'mobile-safari');
                break;
            case 'desktop':
                await runTestsByProject('chromium-desktop', 'firefox-desktop', 'webkit-desktop');
                break;
            case 'chrome':
                await runTestsByProject('chromium-desktop', 'mobile-chrome');
                break;
            case 'firefox':
                await runTestsByProject('firefox-desktop');
                break;
            case 'safari':
                await runTestsByProject('webkit-desktop', 'mobile-safari');
                break;
            case 'headed':
                await runTestsHeaded();
                break;
            case 'debug':
                await runTestsDebug();
                break;
            case 'report':
                await showReport();
                break;
            case 'clean':
                await cleanResults();
                break;
            case 'install':
                await installBrowsers();
                break;
            case 'help':
            default:
                showHelp();
                break;
        }
    } catch (error) {
        console.error('❌ テスト実行中にエラーが発生しました:', error.message);
        process.exit(1);
    }
}

// すべてのテストを実行
async function runAllTests() {
    console.log('🚀 すべてのテストを実行中...\n');

    const startTime = Date.now();

    try {
        execSync('npx playwright test', {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        const duration = Date.now() - startTime;
        console.log(`\n✅ すべてのテストが完了しました (${formatDuration(duration)})`);

        await showSummary();

    } catch (error) {
        console.error('\n❌ テストが失敗しました');
        process.exit(1);
    }
}

// 特定のテストパターンで実行
async function runTestsByGrep(pattern) {
    console.log(`🎯 パターン "${pattern}" に一致するテストを実行中...\n`);

    try {
        execSync(`npx playwright test --grep "${pattern}"`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('\n✅ テストが完了しました');

    } catch (error) {
        console.error('\n❌ テストが失敗しました');
        process.exit(1);
    }
}

// 特定のプロジェクトで実行
async function runTestsByProject(...projects) {
    const projectList = projects.join(' --project ');
    console.log(`🎯 プロジェクト [${projects.join(', ')}] でテストを実行中...\n`);

    try {
        execSync(`npx playwright test --project ${projectList}`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('\n✅ テストが完了しました');

    } catch (error) {
        console.error('\n❌ テストが失敗しました');
        process.exit(1);
    }
}

// ヘッド付きモードで実行
async function runTestsHeaded() {
    console.log('👁️  ブラウザを表示してテストを実行中...\n');

    try {
        execSync('npx playwright test --headed --project chromium-desktop', {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('\n✅ テストが完了しました');

    } catch (error) {
        console.error('\n❌ テストが失敗しました');
        process.exit(1);
    }
}

// デバッグモードで実行
async function runTestsDebug() {
    console.log('🐛 デバッグモードでテストを実行中...\n');
    console.log('💡 ブラウザが開き、ステップ実行が可能です');
    console.log('💡 Playwright Inspectorが起動します\n');

    try {
        execSync('npx playwright test --debug --project chromium-desktop', {
            stdio: 'inherit',
            cwd: process.cwd()
        });

    } catch (error) {
        console.error('\n❌ デバッグセッションが終了しました');
    }
}

// テストレポートを表示
async function showReport() {
    const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');

    if (!fs.existsSync(reportPath)) {
        console.log('📊 テストレポートが見つかりません');
        console.log('💡 まずテストを実行してください: node run-tests.js all');
        return;
    }

    console.log('📊 テストレポートを表示中...');

    try {
        execSync(`npx playwright show-report`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
    } catch (error) {
        console.log(`📁 レポートファイル: ${reportPath}`);
        console.log('💡 ブラウザで上記ファイルを開いてください');
    }
}

// テスト結果をクリーンアップ
async function cleanResults() {
    console.log('🧹 テスト結果をクリーンアップ中...');

    const dirsToClean = [
        'playwright-report',
        'test-results',
        '.playwright'
    ];

    let cleaned = 0;

    for (const dir of dirsToClean) {
        const dirPath = path.join(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            try {
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(`🗑️  削除: ${dir}`);
                cleaned++;
            } catch (error) {
                console.warn(`⚠️  削除失敗: ${dir} - ${error.message}`);
            }
        }
    }

    if (cleaned > 0) {
        console.log(`✅ ${cleaned}個のディレクトリをクリーンアップしました`);
    } else {
        console.log('💡 クリーンアップするファイルはありませんでした');
    }
}

// Playwrightブラウザをインストール
async function installBrowsers() {
    console.log('📥 Playwrightブラウザをインストール中...');
    console.log('💡 この処理には数分かかる場合があります\n');

    try {
        execSync('npx playwright install', {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('\n✅ ブラウザのインストールが完了しました');

    } catch (error) {
        console.error('\n❌ ブラウザのインストールに失敗しました');
        process.exit(1);
    }
}

// サマリーを表示
async function showSummary() {
    const summaryPath = path.join(process.cwd(), 'playwright-report', 'summary.md');

    if (fs.existsSync(summaryPath)) {
        console.log('\n📊 テスト結果サマリー:');
        console.log('─'.repeat(50));

        try {
            const summary = fs.readFileSync(summaryPath, 'utf8');
            // Markdownから基本的な情報を抽出して表示
            const lines = summary.split('\n');
            let inResults = false;

            for (const line of lines) {
                if (line.includes('## テスト結果')) {
                    inResults = true;
                    continue;
                }
                if (inResults && line.startsWith('|') && !line.includes('---')) {
                    console.log(line.replace(/\|/g, ' ').trim());
                }
                if (line.includes('**成功率**')) {
                    console.log(line.replace(/\*\*/g, ''));
                }
                if (inResults && line.startsWith('##')) {
                    break;
                }
            }
        } catch (error) {
            console.log('サマリーの読み込みに失敗しました');
        }

        console.log('─'.repeat(50));
    }
}

// ヘルプを表示
function showHelp() {
    console.log('📖 使用方法: node run-tests.js <command>\n');
    console.log('利用可能なコマンド:\n');

    Object.entries(commands).forEach(([cmd, desc]) => {
        console.log(`  ${cmd.padEnd(15)} ${desc}`);
    });

    console.log('\n例:');
    console.log('  node run-tests.js all          # すべてのテストを実行');
    console.log('  node run-tests.js mobile        # モバイルテストのみ実行');
    console.log('  node run-tests.js headed        # ブラウザを表示して実行');
    console.log('  node run-tests.js debug         # デバッグモードで実行');
    console.log('  node run-tests.js report        # テストレポートを表示');

    console.log('\n💡 初回実行時は以下を実行してください:');
    console.log('  node run-tests.js install       # ブラウザをインストール');
}

// 時間フォーマット関数
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
        return `${minutes}分${seconds % 60}秒`;
    } else {
        return `${seconds}秒`;
    }
}

// スクリプト実行
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 予期しないエラーが発生しました:', error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    runTestsByGrep,
    runTestsByProject,
    showReport,
    cleanResults
};