#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { SecurityGroupStack } from '../lib/security-group-stack';
import { ClientVpnStack } from '../lib/client-vpn-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
};

// VPCスタック
const vpcStack = new VpcStack(app, 'VpnNetworkStack', { env });

// セキュリティグループスタック
const securityGroupStack = new SecurityGroupStack(app, 'CorporateVpnSecurityGroupStack', {
  env,
  vpc: vpcStack.vpc,
});
securityGroupStack.addDependency(vpcStack);

// Client VPNスタック
const clientVpnStack = new ClientVpnStack(app, 'CorporateVpnClientVpnStack', {
  env,
  vpc: vpcStack.vpc,
  publicSubnet: vpcStack.publicSubnet,
});
clientVpnStack.addDependency(vpcStack);
