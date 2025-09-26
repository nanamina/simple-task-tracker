# Contributing to Simple Task Tracker

Thank you for your interest in contributing to Simple Task Tracker!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install && cd cdk && npm install`
3. Run tests: `npm test`
4. Set up CI/CD: `./setup-cicd.sh`

## Testing

- Unit tests: `npm run test:unit`
- UI tests: `npm run test:ui`
- CDK tests: `cd cdk && npm test`

## Deployment

- Local testing: `./setup-cicd.sh test`
- AWS deployment: `./deploy-aws.sh`

## Code Style

- Follow existing code patterns
- Add tests for new features
- Update documentation as needed

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Ensure all tests pass
5. Submit a pull request

For more details, see README-CICD.md
