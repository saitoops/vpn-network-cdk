import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.CfnVPC;
  public readonly privateSubnet: ec2.Subnet;
  public readonly publicSubnet: ec2.Subnet;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectName = 'corporate-vpn';

    // VPC
    this.vpc = new ec2.CfnVPC(this, `${projectName}-vpc`, {
      cidrBlock: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: [{ key: 'Name', value: `${projectName}-vpc` }],
    });

    // Private Subnet
    this.privateSubnet = new ec2.Subnet(this, `${projectName}-private-subnet`, {
      cidrBlock: '10.0.0.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1a',
    });
    cdk.Tags.of(this.privateSubnet).add('Name', `${projectName}-private-subnet`);

    // Public Subnet
    this.publicSubnet = new ec2.Subnet(this, `${projectName}-public-subnet`, {
      cidrBlock: '10.0.10.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1c',
    });
    cdk.Tags.of(this.publicSubnet).add('Name', `${projectName}-public-subnet`);

    // Internet Gateway
    const igw = new ec2.CfnInternetGateway(this, `${projectName}-internet-gateway`, {
      tags: [
        {
          key: 'Name',
          value: `${projectName}-internet-gateway`,
        },
      ],
    });

    // VPC Gateway Attachment
    new ec2.CfnVPCGatewayAttachment(this, `${projectName}-vpc-gateway-attachment`, {
      vpcId: this.vpc.ref,
      internetGatewayId: igw.ref,
    });
  }
}
