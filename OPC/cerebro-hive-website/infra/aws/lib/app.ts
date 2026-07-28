#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CerebroHiveReviewStack } from './cerebro-review-stack';

const app = new cdk.App();

new CerebroHiveReviewStack(app, 'CerebroHiveReviewStack', {
  env: {
    // Default to us-east-1 for maximum Free Tier coverage
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  description: 'Cerebro Hive Engineering Review Platform — Free Tier deployment',
});
