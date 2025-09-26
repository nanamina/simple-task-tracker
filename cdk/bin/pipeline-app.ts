#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CodeBuildPipelineStack } from '../lib/codebuild-pipeline-stack';

const app = new cdk.App();

// Get configuration from context or environment variables
const githubOwner = app.node.tryGetContext('githubOwner') || process.env.GITHUB_OWNER || '';
const githubRepo = app.node.tryGetContext('githubRepo') || process.env.GITHUB_REPO || 'simple-task-tracker';
const githubBranch = app.node.tryGetContext('githubBranch') || process.env.GITHUB_BRANCH || 'main';
const notificationEmail = app.node.tryGetContext('notificationEmail') || process.env.NOTIFICATION_EMAIL;
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'production';

if (!githubOwner) {
    throw new Error('GitHub owner must be provided via context (-c githubOwner=...) or GITHUB_OWNER environment variable');
}

// Create the pipeline stack
new CodeBuildPipelineStack(app, 'SimpleTaskTrackerPipelineStack', {
    githubOwner,
    githubRepo,
    githubBranch,
    notificationEmail,
    environment,

    // Stack configuration
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
    },

    description: `Simple Task Tracker CI/CD Pipeline (${environment})`,

    tags: {
        Project: 'SimpleTaskTracker',
        Environment: environment,
        ManagedBy: 'CDK',
        Component: 'Pipeline',
    },
});

app.synth();