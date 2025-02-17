#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FakeCdkProjectStack } from '../lib/fake-cdk-project-stack';

const app = new cdk.App();
new FakeCdkProjectStack(app, 'FakeCdkProjectStack');
