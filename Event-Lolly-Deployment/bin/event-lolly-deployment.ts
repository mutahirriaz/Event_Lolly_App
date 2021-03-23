#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EventLollyDeploymentStack } from '../lib/event-lolly-deployment-stack';

const app = new cdk.App();
new EventLollyDeploymentStack(app, 'EventLollyDeploymentStack');
