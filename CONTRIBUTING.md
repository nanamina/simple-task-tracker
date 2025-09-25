# Contributing to Simple Task Tracker

Thank you for your interest in contributing to Simple Task Tracker! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/simple-task-tracker.git
   cd simple-task-tracker
   ```
3. **Install dependencies**:
   ```bash
   npm install
   cd cdk && npm install && cd ..
   ```
4. **Run tests** to ensure everything works:
   ```bash
   ./setup-cicd.sh test
   ```

## 🔄 Development Workflow

### Creating a Feature Branch

```bash
# Start from main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### Making Changes

1. **Write code** following our style guidelines
2. **Add tests** for new functionality
3. **Update documentation** if needed
4. **Test your changes**:
   ```bash
   # Run all tests
   npm test
   
   # Run specific test types
   npm run test:unit
   npm run test:ui
   npm run test:accessibility
   ```

### Committing Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "Add task priority feature

- Add priority dropdown to task creation
- Update task display to show priority colors
- Add tests for priority functionality"

# Push to your fork
git push origin feature/your-feature-name
```

### Creating a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch and fill out the PR template
4. Wait for CI/CD checks to pass
5. Address any review feedback

## 📝 Code Style Guidelines

### JavaScript/HTML/CSS

- **Indentation**: 2 spaces (no tabs)
- **Naming**: Use camelCase for variables and functions
- **Comments**: Add comments for complex logic
- **Accessibility**: Ensure all UI elements are accessible

### Example:
```javascript
// Good
function addTaskWithPriority(taskText, priority) {
  // Validate input before processing
  if (!taskText.trim()) {
    showErrorMessage('Task text cannot be empty');
    return false;
  }
  
  const task = createTaskElement(taskText, priority);
  appendTaskToList(task);
  return true;
}

// Bad
function addTask(t,p){
  if(!t)return;
  let x=document.createElement('div');
  x.innerHTML=t;
  document.getElementById('tasks').appendChild(x);
}
```

### CDK/TypeScript

- **Types**: Use explicit types where helpful
- **Naming**: Use PascalCase for classes, camelCase for variables
- **Documentation**: Add JSDoc comments for public methods

### Example:
```typescript
/**
 * Creates an S3 bucket for static website hosting
 * @param bucketName - The name of the S3 bucket
 * @param environment - The deployment environment (dev, staging, production)
 */
private createWebsiteBucket(bucketName: string, environment: string): s3.Bucket {
  return new s3.Bucket(this, 'WebsiteBucket', {
    // Configuration here
  });
}
```

## 🧪 Testing Guidelines

### Test Types

1. **Unit Tests** (`simple-task-tracker.test.js`)
   - Test individual functions
   - Mock external dependencies
   - Fast execution

2. **Integration Tests** (Playwright)
   - Test user workflows
   - Cross-browser compatibility
   - Real browser environment

3. **Accessibility Tests**
   - WCAG compliance
   - Keyboard navigation
   - Screen reader compatibility

4. **CDK Tests** (`cdk/test/`)
   - Infrastructure unit tests
   - Resource configuration validation

### Writing Tests

```javascript
// Unit test example
describe('Task Management', () => {
  it('should add task with valid input', () => {
    const result = addTask('Test task');
    expect(result).toBe(true);
    expect(getTaskCount()).toBe(1);
  });
  
  it('should reject empty task input', () => {
    const result = addTask('');
    expect(result).toBe(false);
    expect(getTaskCount()).toBe(0);
  });
});

// Playwright test example
test('should create and delete task', async ({ page }) => {
  await page.goto('/');
  
  // Add task
  await page.fill('#task-input', 'Test task');
  await page.click('#add-button');
  
  // Verify task appears
  await expect(page.locator('.task-item')).toContainText('Test task');
  
  // Delete task
  await page.click('.delete-button');
  
  // Verify task is removed
  await expect(page.locator('.task-item')).toHaveCount(0);
});
```

## 🏗️ Infrastructure Changes

### CDK Development

1. **Test locally** before pushing:
   ```bash
   cd cdk
   npm run build
   npm test
   npx cdk synth
   ```

2. **Follow AWS best practices**:
   - Use least privilege IAM policies
   - Enable encryption where applicable
   - Consider cost implications

3. **Document infrastructure changes** in PR description

### Deployment Testing

```bash
# Test deployment without actually deploying
./deploy-aws.sh --dry-run

# Test in development environment
./deploy-aws.sh -e dev
```

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Modifying deployment process
- Updating dependencies

### Documentation Files

- `README.md` - Project overview
- `README-simple-task-tracker.md` - User guide
- `README-CICD.md` - CI/CD documentation
- `DEPLOYMENT.md` - AWS deployment guide
- Code comments for complex logic

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test in multiple browsers** if UI-related
3. **Try to reproduce** the issue consistently

### Good Bug Report

```markdown
**Bug**: Task deletion doesn't work on mobile Safari

**Steps to Reproduce**:
1. Open app on iPhone Safari
2. Add a task
3. Tap delete button
4. Nothing happens

**Expected**: Task should be deleted
**Actual**: Task remains in list

**Environment**: iPhone 12, Safari 15.0, iOS 15.2
```

## 🚀 Feature Requests

### Before Requesting

1. **Check existing issues** and discussions
2. **Consider the scope** - does it fit the project goals?
3. **Think about implementation** - is it feasible?

### Good Feature Request

```markdown
**Feature**: Task categories/tags

**Problem**: Users want to organize tasks by category (work, personal, etc.)

**Solution**: Add optional category field to tasks with color coding

**Alternatives**: 
- Separate task lists
- Text-based tags

**Implementation Notes**:
- Should be optional (backward compatible)
- Mobile-friendly UI needed
- Consider accessibility (not just color coding)
```

## 🔒 Security

### Reporting Security Issues

**Do not** open public issues for security vulnerabilities.

Instead:
1. Email the maintainers directly
2. Provide detailed description
3. Include steps to reproduce
4. Allow time for fix before disclosure

### Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use HTTPS for all external requests
- Follow AWS security best practices

## 📋 Pull Request Process

### Before Submitting

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] PR template filled out

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** and merge

### After Merge

- Your changes are automatically deployed to production
- Monitor deployment in GitHub Actions
- Check the live site to ensure everything works

## 🎯 Project Goals

Keep these in mind when contributing:

- **Simplicity**: Easy to use and understand
- **Accessibility**: Works for everyone
- **Performance**: Fast and responsive
- **Reliability**: Robust and well-tested
- **Maintainability**: Clean, documented code

## 🤝 Community

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the project goals

### Getting Help

- **Documentation**: Check README files first
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask questions in PR comments

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributor graphs
- Release notes for significant contributions
- Project documentation (with permission)

Thank you for contributing to Simple Task Tracker! 🎉