import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface SecurityGroupStackProps extends cdk.StackProps {
  vpc: ec2.CfnVPC;
}

export class SecurityGroupStack extends cdk.Stack {
  public readonly securityGroup: ec2.CfnSecurityGroup;

  constructor(scope: Construct, id: string, props: SecurityGroupStackProps) {
    super(scope, id, props);

    const projectName = 'corporate-vpn';

    // Security Group
    this.securityGroup = new ec2.CfnSecurityGroup(this, `${projectName}-security-group`, {
      groupName: `${projectName}-security-group`,
      groupDescription: 'Client VPN security group',
      vpcId: props.vpc.ref,
      securityGroupEgress: [
        {
          ipProtocol: '-1',
          cidrIp: '0.0.0.0/0',
        },
      ],
      securityGroupIngress: [
        {
          ipProtocol: '-1',
        },
      ],
      tags: [
        {
          key: 'Name',
          value: `${projectName}-security-group`,
        },
      ],
    });
  }
}
