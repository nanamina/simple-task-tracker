#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SimpleTaskTrackerStack } from '../lib/simple-task-tracker-stack';

const app = new cdk.App();

// 環境設定
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1', // 東京リージョン
};

// スタック作成
new SimpleTaskTrackerStack(app, 'SimpleTaskTrackerStack', {
    env,
    description: 'Simple Task Tracker - Static Website Hosting with S3 and CloudFront',

    // タグ設定
    tags: {
        Project: 'SimpleTaskTracker',
        Environment: process.env.ENVIRONMENT || 'production',
        Owner: 'SimpleTaskTrackerTeam',
        CostCenter: 'Development',
    },
});