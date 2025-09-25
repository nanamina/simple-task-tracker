#!/bin/bash

# Simple Task Tracker - CI/CD Setup Script
# This script helps set up the CI/CD pipeline for the project

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
Simple Task Tracker - CI/CD Setup Script

Usage:
    $0 [command]

Commands:
    setup       Set up CI/CD pipeline (default)
    validate    Validate current setup
    test        Run local tests
    help        Show this help

Examples:
    $0 setup
    $0 validate
    $0 test
EOF
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi

    # Check if GitHub workflows directory exists
    if [[ ! -d ".github/workflows" ]]; then
        log_error ".github/workflows directory not found"
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 16 ]]; then
        log_error "Node.js v16+ is required (current: $(node --version))"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi

    # Check AWS CLI (optional but recommended)
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI is not installed (recommended for local testing)"
    fi

    log_success "Prerequisites check completed"
}

# Validate workflow files
validate_workflows() {
    log_info "Validating workflow files..."

    local workflows=(
        ".github/workflows/ci.yml"
        ".github/workflows/deploy.yml"
        ".github/workflows/pr-validation.yml"
        ".github/workflows/maintenance.yml"
    )

    for workflow in "${workflows[@]}"; do
        if [[ -f "$workflow" ]]; then
            log_success "✓ $workflow exists"
            
            # Basic YAML validation
            if command -v yamllint &> /dev/null; then
                if yamllint "$workflow" > /dev/null 2>&1; then
                    log_success "  ✓ YAML syntax is valid"
                else
                    log_warning "  ⚠ YAML syntax issues detected"
                fi
            fi
        else
            log_error "✗ $workflow is missing"
        fi
    done
}

# Check required files
check_required_files() {
    log_info "Checking required files..."

    local required_files=(
        "simple-task-tracker-standalone.html"
        "task-tracker-script.js"
        "task-tracker-styles.css"
        "deploy-aws.sh"
        "package.json"
        "cdk/package.json"
        "playwright.config.js"
    )

    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "✓ $file exists"
        else
            log_error "✗ $file is missing"
        fi
    done
}

# Setup function
setup_cicd() {
    log_info "Setting up CI/CD pipeline..."

    check_prerequisites
    validate_workflows
    check_required_files

    # Install dependencies
    log_info "Installing dependencies..."
    if [[ -f "package.json" ]]; then
        npm install
        log_success "Main project dependencies installed"
    fi

    if [[ -f "cdk/package.json" ]]; then
        cd cdk
        npm install
        cd ..
        log_success "CDK dependencies installed"
    fi

    # Make scripts executable
    if [[ -f "deploy-aws.sh" ]]; then
        chmod +x deploy-aws.sh
        log_success "deploy-aws.sh made executable"
    fi

    if [[ -f "setup-cicd.sh" ]]; then
        chmod +x setup-cicd.sh
        log_success "setup-cicd.sh made executable"
    fi

    # Create .gitignore entries if needed
    if [[ -f ".gitignore" ]]; then
        if ! grep -q "test-results/" .gitignore; then
            echo "test-results/" >> .gitignore
            log_info "Added test-results/ to .gitignore"
        fi
        
        if ! grep -q "playwright-report/" .gitignore; then
            echo "playwright-report/" >> .gitignore
            log_info "Added playwright-report/ to .gitignore"
        fi
    fi

    log_success "CI/CD pipeline setup completed!"
    echo
    log_info "Next steps:"
    echo "1. Configure GitHub repository secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ACCOUNT_ID)"
    echo "2. Set up branch protection rules for 'main' branch"
    echo "3. Create deployment environments (production, staging, dev)"
    echo "4. Push changes to trigger the first CI run"
    echo
    log_info "For detailed instructions, see README-CICD.md"
}

# Validate current setup
validate_setup() {
    log_info "Validating current CI/CD setup..."

    check_prerequisites
    validate_workflows
    check_required_files

    # Check if dependencies are installed
    if [[ -d "node_modules" ]]; then
        log_success "✓ Main project dependencies installed"
    else
        log_warning "⚠ Main project dependencies not installed (run: npm install)"
    fi

    if [[ -d "cdk/node_modules" ]]; then
        log_success "✓ CDK dependencies installed"
    else
        log_warning "⚠ CDK dependencies not installed (run: cd cdk && npm install)"
    fi

    # Check if scripts are executable
    if [[ -x "deploy-aws.sh" ]]; then
        log_success "✓ deploy-aws.sh is executable"
    else
        log_warning "⚠ deploy-aws.sh is not executable (run: chmod +x deploy-aws.sh)"
    fi

    # Check git status
    if git status --porcelain | grep -q .; then
        log_warning "⚠ There are uncommitted changes"
    else
        log_success "✓ Working directory is clean"
    fi

    # Check remote
    if git remote get-url origin > /dev/null 2>&1; then
        REMOTE_URL=$(git remote get-url origin)
        log_success "✓ Git remote configured: $REMOTE_URL"
    else
        log_warning "⚠ No git remote configured"
    fi

    log_success "Validation completed!"
}

# Run local tests
run_tests() {
    log_info "Running local tests..."

    check_prerequisites

    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing main project dependencies..."
        npm install
    fi

    if [[ ! -d "cdk/node_modules" ]]; then
        log_info "Installing CDK dependencies..."
        cd cdk && npm install && cd ..
    fi

    # Run CDK tests
    log_info "Running CDK tests..."
    cd cdk
    npm run build
    npm test
    cd ..
    log_success "CDK tests passed"

    # Run unit tests
    log_info "Running unit tests..."
    npm run test:unit
    log_success "Unit tests passed"

    # Install Playwright if needed
    if ! npx playwright --version > /dev/null 2>&1; then
        log_info "Installing Playwright browsers..."
        npx playwright install --with-deps
    fi

    # Run UI tests
    log_info "Running UI tests..."
    npm run test:ui
    log_success "UI tests passed"

    log_success "All local tests passed!"
}

# Main execution
main() {
    case "${1:-setup}" in
        setup)
            setup_cicd
            ;;
        validate)
            validate_setup
            ;;
        test)
            run_tests
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