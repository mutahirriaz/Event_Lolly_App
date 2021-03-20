#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EventLollyBackendStack } from '../lib/event_lolly_backend-stack';

const app = new cdk.App();
new EventLollyBackendStack(app, 'EventLollyBackendStack');
