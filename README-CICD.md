# 🚀 CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline setup for the Simple Task Tracker project.

## 📋 Overview

The CI/CD pipeline consists of four main workflows that automate testing, validation, deployment, and maintenance:

1. **🔄 Continuous Integration** (`ci.yml`) - Runs on every push and PR
2. **🚀 Deployment** (`deploy.yml`) - Deploys to AWS on main branch
3. **🔍 Pull Request Validation** (`pr-validation.yml`) - Validates PRs before merge
4. **🔧 Maintenance & Monitoring** (`maintenance.yml`) - Daily health checks and maintenance

## 🔄 Continuous Integration Workflow

**Trigger**: Push to `main`/`develop` branches, Pull Requests

### Jobs Overview

| Job | Purpose | Duration |
|-----|---------|----------|
| **Code Quality** | Syntax validation, file structure checks | ~2 min |
| **CDK Tests** | Infrastructure unit tests, CDK synthesis | ~3 min |
| **Unit Tests** | JavaScript unit tests | ~2 min |
| **Integration Tests** | UI, accessibility, mobile/desktop tests | ~5 min |
| **Cross-browser Tests** | Chrome, Firefox compatibility | ~4 min |
| **Security & Performance** | Vulnerability scans, bundle size checks | ~2 min |
| **Build Validation** | Deployment readiness validation | ~3 min |

### Test Coverage

- ✅ **JavaScript Syntax**: Node.js syntax validation
- ✅ **HTML Structure**: Required elements and references
- ✅ **CDK Infrastructure**: Unit tests with Jest
- ✅ **UI Functionality**: Playwright end-to-end tests
- ✅ **Accessibility**: WCAG compliance checks
- ✅ **Cross-browser**: Chrome, Firefox compatibility
- ✅ **Mobile Responsive**: Mobile and desktop layouts
- ✅ **Security**: Dependency vulnerabilities, sensitive data patterns
- ✅ **Performance**: Bundle size analysis

## 🚀 Deployment Workflow

**Trigger**: Push to `main` branch, Manual dispatch

### Deployment Environments

| Environment | Trigger | Purpose |
|-------------|---------|---------|
| **Production** | Push to `main` | Live website |
| **Staging** | Manual dispatch | Pre-production testing |
| **Development** | Manual dispatch | Development testing |

### Deployment Process

1. **Pre-deployment Validation**
   - Critical test execution
   - Configuration validation
   - Custom domain validation (if provided)

2. **AWS Deployment**
   - CDK bootstrap (if needed)
   - Infrastructure deployment
   - File upload to S3
   - CloudFront distribution

3. **Post-deployment Validation**
   - Website availability check
   - Smoke tests execution
   - Production Playwright tests
   - Performance validation

### Manual Deployment

```bash
# Trigger manual deployment via GitHub Actions
# Go to Actions → Deploy to AWS → Run workflow
# Select environment and optionally provide custom domain
```

## 🔍 Pull Request Validation

**Trigger**: PR opened/updated to `main`/`develop`

### Smart Validation

The workflow intelligently detects changed files and runs relevant validations:

| Change Type | Validations |
|-------------|-------------|
| **Frontend** (HTML/CSS/JS) | Structure validation, syntax checks, UI tests |
| **CDK** (Infrastructure) | CDK tests, security validation, synthesis |
| **Tests** | Test coverage analysis |
| **Configuration** | Manual review flagged |

### Validation Checks

- 🎨 **Frontend Validation**: HTML structure, JavaScript syntax, CSS validation
- 🏗️ **CDK Validation**: Infrastructure tests, security best practices
- 🧪 **Test Coverage**: Test file analysis, coverage metrics
- ⚡ **Performance Impact**: File size analysis, anti-pattern detection
- ♿ **Accessibility**: WCAG compliance, semantic HTML

## 🔧 Maintenance & Monitoring

**Trigger**: Daily at 2 AM UTC, Manual dispatch

### Maintenance Tasks

| Task | Frequency | Purpose |
|------|-----------|---------|
| **Health Check** | Daily | AWS resources, website availability |
| **Security Audit** | Daily | Dependency vulnerabilities, sensitive data |
| **Dependency Updates** | Daily | Outdated packages, security patches |
| **Cleanup** | Daily | Old resources, artifact management |
| **Performance Monitoring** | Daily | Response times, CloudWatch metrics |

### Health Monitoring

- 🏥 **AWS Resources**: Stack status, CloudFront distribution
- 🌐 **Website Availability**: HTTP status, response times
- 📊 **CloudWatch Metrics**: Request counts, error rates
- 🔒 **Security**: Vulnerability scans, permission checks
- ⚡ **Performance**: Average response times, performance trends

## ⚙️ Setup Instructions

### 1. Repository Secrets

Configure the following secrets in your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key for deployment | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for deployment | `wJalr...` |
| `AWS_ACCOUNT_ID` | Your AWS account ID | `123456789012` |

### 2. AWS Permissions

The AWS user needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "cloudfront:*",
        "iam:*",
        "lambda:*",
        "route53:*",
        "acm:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Branch Protection

Configure branch protection rules:

```
Settings → Branches → Add rule
```

- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required status checks:
  - `Code Quality`
  - `CDK Infrastructure Tests`
  - `Unit Tests`
  - `Integration & UI Tests`

### 4. Environment Configuration

Create deployment environments:

```
Settings → Environments → New environment
```

| Environment | Protection Rules |
|-------------|------------------|
| **production** | Required reviewers, deployment branches: `main` |
| **staging** | Deployment branches: `main`, `develop` |
| **dev** | No restrictions |

## 📊 Monitoring & Alerts

### GitHub Actions Notifications

- ✅ **Success**: Deployment completion notifications
- ❌ **Failure**: Immediate failure notifications with logs
- ⚠️ **Warning**: Performance or security warnings

### AWS Monitoring

- 📈 **CloudWatch**: Automatic metrics collection
- 🚨 **Alarms**: Set up for high error rates or slow response times
- 📊 **Dashboard**: CloudFront and S3 metrics visualization

## 🔧 Troubleshooting

### Common Issues

#### 1. Deployment Failures

```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify CDK bootstrap
cdk bootstrap aws://ACCOUNT-ID/REGION

# Check stack status
aws cloudformation describe-stacks --stack-name SimpleTaskTrackerStack
```

#### 2. Test Failures

```bash
# Run tests locally
npm test
npm run test:ui

# Check Playwright browsers
npx playwright install --with-deps
```

#### 3. Permission Issues

- Verify AWS IAM permissions
- Check GitHub repository secrets
- Ensure branch protection rules are correct

### Debug Mode

Enable debug logging in workflows:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## 📈 Performance Metrics

### Build Times

| Workflow | Average Duration | Parallel Jobs |
|----------|------------------|---------------|
| CI | ~8 minutes | 8 jobs |
| Deployment | ~12 minutes | 4 jobs |
| PR Validation | ~6 minutes | 7 jobs |
| Maintenance | ~5 minutes | 6 jobs |

### Resource Usage

- **Compute**: ~30 minutes/day for scheduled tasks
- **Storage**: Artifacts retained for 7-30 days
- **Network**: Minimal data transfer for tests

## 🔄 Workflow Updates

### Adding New Tests

1. Add test files to appropriate directories
2. Update workflow files if needed
3. Test locally before committing
4. Update documentation

### Modifying Deployment

1. Test CDK changes locally
2. Update deployment workflow if needed
3. Test in staging environment first
4. Document any breaking changes

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Playwright Documentation](https://playwright.dev/)
- [Simple Task Tracker Deployment Guide](./DEPLOYMENT.md)

---

**🎯 Goal**: Fully automated, reliable, and secure CI/CD pipeline for Simple Task Tracker

**📞 Support**: Check workflow logs and GitHub Issues for troubleshooting