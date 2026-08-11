#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CerebroHiveReviewStack } from './cerebro-review-stack';

const app = new cdk.App();

new CerebroHiveReviewStack(app, 'CerebroHiveReviewStack', {
  env: {
    // ap-south-1 (Mumbai) — lowest latency from India, Free Tier applies globally
    region: process.env.CDK_DEFAULT_REGION ?? 'ap-south-1',
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  description: 'Cerebro Hive Engineering Review Platform — Free Tier deployment',
});
