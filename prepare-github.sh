#!/bin/bash

# Simple Task Tracker - GitHub Preparation Script
# This script prepares the project for GitHub by cleaning up unnecessary files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Help function
show_help() {
    cat << EOF
Simple Task Tracker - GitHub Preparation Script

Usage:
    $0 [command]

Commands:
    clean       Clean up unnecessary files (default)
    archive     Archive backup files
    validate    Validate repository structure
    prepare     Full preparation (clean + archive + validate)
    help        Show this help

Examples:
    $0 clean
    $0 archive
    $0 prepare
EOF
}

# Clean up unnecessary files
clean_files() {
    log_info "Cleaning up unnecessary files..."

    # Remove test results and reports
    if [[ -d "test-results" ]]; then
        log_info "Removing test results..."
        rm -rf test-results/
        log_success "Test results removed"
    fi

    if [[ -d "playwright-report" ]]; then
        log_info "Removing Playwright reports..."
        rm -rf playwright-report/
        log_success "Playwright reports removed"
    fi

    # Remove CDK output
    if [[ -d "cdk/cdk.out" ]]; then
        log_info "Removing CDK output..."
        rm -rf cdk/cdk.out/
        log_success "CDK output removed"
    fi

    if [[ -d "cdk/dist" ]]; then
        log_info "Removing CDK dist..."
        rm -rf cdk/dist/
        log_success "CDK dist removed"
    fi

    # Remove node_modules (will be reinstalled via CI/CD)
    if [[ -d "node_modules" ]]; then
        log_warning "Removing node_modules (will be reinstalled via package.json)..."
        rm -rf node_modules/
        log_success "node_modules removed"
    fi

    if [[ -d "cdk/node_modules" ]]; then
        log_warning "Removing cdk/node_modules (will be reinstalled via package.json)..."
        rm -rf cdk/node_modules/
        log_success "cdk/node_modules removed"
    fi

    # Remove log files
    find . -name "*.log" -type f -delete 2>/dev/null || true
    log_success "Log files removed"

    # Remove temporary files
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
    log_success "Temporary files removed"

    log_success "File cleanup completed"
}

# Archive backup files
archive_backup() {
    log_info "Archiving backup files..."

    if [[ -d "bkup" ]]; then
        # Create archive
        ARCHIVE_NAME="task-management-system-backup-$(date +%Y%m%d).tar.gz"
        
        log_info "Creating archive: $ARCHIVE_NAME"
        tar -czf "$ARCHIVE_NAME" bkup/
        
        # Remove original backup directory
        rm -rf bkup/
        
        log_success "Backup archived as: $ARCHIVE_NAME"
        log_info "You can extract it later with: tar -xzf $ARCHIVE_NAME"
    else
        log_info "No backup directory found to archive"
    fi
}

# Validate repository structure
validate_structure() {
    log_info "Validating repository structure..."

    # Check essential files
    local essential_files=(
        "simple-task-tracker-standalone.html"
        "task-tracker-script.js"
        "task-tracker-styles.css"
        "package.json"
        "README.md"
        "README-simple-task-tracker.md"
        "README-CICD.md"
        "DEPLOYMENT.md"
        "deploy-aws.sh"
        "setup-cicd.sh"
        ".gitignore"
    )

    for file in "${essential_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "✓ $file"
        else
            log_error "✗ $file (missing)"
        fi
    done

    # Check essential directories
    local essential_dirs=(
        ".github/workflows"
        "cdk"
        "playwright-tests"
    )

    for dir in "${essential_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            log_success "✓ $dir/"
        else
            log_error "✗ $dir/ (missing)"
        fi
    done

    # Check workflow files
    local workflow_files=(
        ".github/workflows/ci.yml"
        ".github/workflows/deploy.yml"
        ".github/workflows/pr-validation.yml"
        ".github/workflows/maintenance.yml"
    )

    for workflow in "${workflow_files[@]}"; do
        if [[ -f "$workflow" ]]; then
            log_success "✓ $workflow"
        else
            log_error "✗ $workflow (missing)"
        fi
    done

    # Check CDK files
    local cdk_files=(
        "cdk/package.json"
        "cdk/lib/simple-task-tracker-stack.ts"
        "cdk/bin/simple-task-tracker.ts"
        "cdk/test/simple-task-tracker.test.ts"
    )

    for cdk_file in "${cdk_files[@]}"; do
        if [[ -f "$cdk_file" ]]; then
            log_success "✓ $cdk_file"
        else
            log_error "✗ $cdk_file (missing)"
        fi
    done

    log_success "Repository structure validation completed"
}

# Check file sizes
check_file_sizes() {
    log_info "Checking file sizes..."

    # Check for large files that shouldn't be in git
    LARGE_FILES=$(find . -type f -size +10M 2>/dev/null | grep -v ".git" | head -10)
    
    if [[ -n "$LARGE_FILES" ]]; then
        log_warning "Large files found (>10MB):"
        echo "$LARGE_FILES"
        log_warning "Consider adding these to .gitignore if they shouldn't be tracked"
    else
        log_success "No unusually large files found"
    fi

    # Show repository size
    REPO_SIZE=$(du -sh . 2>/dev/null | cut -f1)
    log_info "Repository size: $REPO_SIZE"
}

# Generate repository summary
generate_summary() {
    log_info "Generating repository summary..."

    echo
    echo "📊 Repository Summary"
    echo "===================="
    echo

    # Count files by type
    HTML_FILES=$(find . -name "*.html" -type f | wc -l)
    JS_FILES=$(find . -name "*.js" -type f | wc -l)
    CSS_FILES=$(find . -name "*.css" -type f | wc -l)
    TS_FILES=$(find . -name "*.ts" -type f | wc -l)
    MD_FILES=$(find . -name "*.md" -type f | wc -l)
    YML_FILES=$(find . -name "*.yml" -type f | wc -l)

    echo "📁 File Types:"
    echo "  HTML files: $HTML_FILES"
    echo "  JavaScript files: $JS_FILES"
    echo "  CSS files: $CSS_FILES"
    echo "  TypeScript files: $TS_FILES"
    echo "  Markdown files: $MD_FILES"
    echo "  YAML files: $YML_FILES"
    echo

    # Show directory structure
    echo "📂 Directory Structure:"
    tree -I 'node_modules|.git|test-results|playwright-report|cdk.out|dist' -L 2 2>/dev/null || {
        echo "  (tree command not available, using ls)"
        ls -la
    }
    echo

    # Git status
    if git status --porcelain 2>/dev/null | grep -q .; then
        echo "📝 Git Status: Uncommitted changes present"
        git status --short 2>/dev/null || echo "  (git status not available)"
    else
        echo "📝 Git Status: Working directory clean"
    fi
    echo

    log_success "Repository summary generated"
}

# Full preparation
full_preparation() {
    log_info "Starting full GitHub preparation..."
    echo

    clean_files
    echo

    archive_backup
    echo

    validate_structure
    echo

    check_file_sizes
    echo

    generate_summary
    echo

    log_success "🎉 GitHub preparation completed!"
    echo
    log_info "Next steps:"
    echo "1. Review the repository summary above"
    echo "2. Commit your changes: git add . && git commit -m 'Prepare for GitHub'"
    echo "3. Create GitHub repository and push: git remote add origin <url> && git push -u origin main"
    echo "4. Configure GitHub repository settings (secrets, branch protection, environments)"
    echo "5. Set up CI/CD pipeline with: ./setup-cicd.sh"
}

# Main execution
main() {
    case "${1:-clean}" in
        clean)
            clean_files
            ;;
        archive)
            archive_backup
            ;;
        validate)
            validate_structure
            ;;
        prepare)
            full_preparation
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"