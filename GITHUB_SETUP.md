# 🚀 GitHub Repository Setup Guide

This guide will help you set up your Simple Task Tracker project on GitHub with full CI/CD integration.

## 📋 Pre-Setup Checklist

Before pushing to GitHub, ensure you have:

- ✅ Cleaned up unnecessary files
- ✅ Archived backup files
- ✅ Validated repository structure
- ✅ Reviewed file sizes

**Run the preparation script:**
```bash
./prepare-github.sh prepare
```

## 🏗️ Step 1: Create GitHub Repository

### Option A: GitHub Web Interface

1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository" or go to https://github.com/new
3. Fill in repository details:
   - **Repository name**: `simple-task-tracker`
   - **Description**: `A simple, elegant task tracker with AWS deployment and CI/CD pipeline`
   - **Visibility**: Public or Private (your choice)
   - **Initialize**: ❌ Don't initialize (we have existing files)

### Option B: GitHub CLI

```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Windows: winget install GitHub.cli

# Login to GitHub
gh auth login

# Create repository
gh repo create simple-task-tracker --public --description "A simple, elegant task tracker with AWS deployment and CI/CD pipeline"
```

## 🔗 Step 2: Connect Local Repository to GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/simple-task-tracker.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## ⚙️ Step 3: Configure Repository Settings

### 3.1 Repository Secrets

Go to `Settings → Secrets and variables → Actions → New repository secret`

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS access key for deployment | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalr...` |
| `AWS_ACCOUNT_ID` | Your AWS account ID | `123456789012` |

### 3.2 Branch Protection Rules

Go to `Settings → Branches → Add rule`

**Branch name pattern**: `main`

Enable:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Include administrators

**Required status checks:**
- `Code Quality`
- `CDK Infrastructure Tests`
- `Unit Tests`
- `Integration & UI Tests`
- `Build Validation`

### 3.3 Environments

Go to `Settings → Environments`

#### Production Environment
- **Name**: `production`
- **Protection rules**:
  - ✅ Required reviewers: Add yourself or team members
  - ✅ Deployment branches: `main` only
  - ⏱️ Wait timer: 0 minutes (or set delay if needed)

#### Staging Environment
- **Name**: `staging`
- **Protection rules**:
  - ✅ Deployment branches: `main` and `develop`

#### Development Environment
- **Name**: `dev`
- **Protection rules**: None (for testing)

### 3.4 General Settings

Go to `Settings → General`

**Features to enable:**
- ✅ Issues
- ✅ Projects
- ✅ Wiki (optional)
- ✅ Discussions (optional)

**Pull Requests:**
- ✅ Allow merge commits
- ✅ Allow squash merging
- ✅ Allow rebase merging
- ✅ Always suggest updating pull request branches
- ✅ Automatically delete head branches

## 🔧 Step 4: Repository Configuration Files

### 4.1 Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
- Device [e.g. iPhone6, Desktop]

**Additional context**
Add any other context about the problem here.
```

### 4.2 Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Infrastructure/CI change

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed (if UI changes)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information or context about the PR.
```

### 4.3 Contributing Guidelines

Create `CONTRIBUTING.md`:

```markdown
# Contributing to Simple Task Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/simple-task-tracker.git`
3. Install dependencies: `npm install && cd cdk && npm install`
4. Run tests: `npm test`

## Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add tests for new functionality
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code patterns
- Ensure accessibility compliance for UI changes

## Testing

- Write unit tests for new functions
- Add integration tests for new features
- Test across different browsers and devices
- Verify accessibility compliance

## Deployment

The project uses automated CI/CD. All changes to `main` branch are automatically deployed to production after passing all tests.
```

## 🚀 Step 5: First Deployment

### 5.1 Trigger CI/CD Pipeline

```bash
# Make a small change to trigger CI
echo "# Simple Task Tracker" > README_TEMP.md
git add README_TEMP.md
git commit -m "Trigger initial CI/CD pipeline"
git push origin main

# Clean up
rm README_TEMP.md
git add README_TEMP.md
git commit -m "Clean up temporary file"
git push origin main
```

### 5.2 Monitor Deployment

1. Go to `Actions` tab in your GitHub repository
2. Watch the CI/CD pipeline execute
3. Check deployment status in the `Deploy to AWS` workflow
4. Verify the deployed website URL in the workflow output

## 📊 Step 6: Repository Monitoring

### 6.1 Enable Notifications

Go to `Settings → Notifications`
- ✅ Email notifications for workflow failures
- ✅ Web notifications for pull requests

### 6.2 Set Up Repository Insights

Go to `Insights` tab to monitor:
- Code frequency
- Commit activity
- Contributors
- Traffic (for public repos)

### 6.3 Security Settings

Go to `Settings → Security & analysis`
- ✅ Dependency graph
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Secret scanning (for public repos)

## 🔧 Step 7: Local Development Workflow

### Daily Development

```bash
# Start development
git checkout main
git pull origin main
git checkout -b feature/new-feature

# Make changes and test
npm test
npm run test:ui

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR via GitHub web interface or CLI
gh pr create --title "Add new feature" --body "Description of changes"
```

### Testing Changes

```bash
# Run all tests locally
./setup-cicd.sh test

# Test deployment (dry run)
./deploy-aws.sh --dry-run

# Validate CI/CD setup
./setup-cicd.sh validate
```

## 🎯 Success Criteria

Your repository is properly set up when:

- ✅ CI/CD pipeline runs on every push/PR
- ✅ All tests pass in the pipeline
- ✅ Automatic deployment to AWS works
- ✅ Branch protection prevents direct pushes to main
- ✅ Required status checks are enforced
- ✅ Environments are configured with proper protection
- ✅ Repository secrets are configured
- ✅ Issue and PR templates are in place

## 🆘 Troubleshooting

### Common Issues

1. **CI/CD Pipeline Fails**
   - Check repository secrets are set correctly
   - Verify AWS permissions
   - Review workflow logs in Actions tab

2. **Deployment Fails**
   - Ensure AWS credentials have sufficient permissions
   - Check CDK bootstrap status
   - Verify region settings

3. **Tests Fail**
   - Run tests locally first: `npm test`
   - Check Playwright browser installation
   - Verify all dependencies are installed

### Getting Help

- Check workflow logs in the Actions tab
- Review error messages in PR checks
- Open an issue using the bug report template
- Check the troubleshooting section in README-CICD.md

## 🎉 Congratulations!

Your Simple Task Tracker is now fully set up on GitHub with enterprise-grade CI/CD! 

Every change will be automatically tested and deployed, ensuring high quality and reliability.
```