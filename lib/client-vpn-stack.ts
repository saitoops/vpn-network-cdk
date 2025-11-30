import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface ClientVpnStackProps extends cdk.StackProps {
  vpc: ec2.CfnVPC;
  publicSubnet: ec2.Subnet;
}

export class ClientVpnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ClientVpnStackProps) {
    super(scope, id, props);

    const projectName = 'corporate-vpn';

    // 環境変数から取得（デプロイ時に設定が必要）
    const certificateArn = process.env.VPN_SERVER_CERTIFICATE_ARN || '';
    const samlProvider = process.env.VPN_SAML_PROVIDER_ARN || '';
    const selfServiceSamlProvider = process.env.VPN_SELF_SERVICE_SAML_PROVIDER_ARN || '';

    // Client VPN Endpoint
    const vpnEndpoint = new ec2.CfnClientVpnEndpoint(this, `${projectName}-client-vpn-endpoint`, {
      authenticationOptions: [
        {
          type: 'federated-authentication',
          federatedAuthentication: {
            samlProviderArn: samlProvider,
            selfServiceSamlProviderArn: selfServiceSamlProvider,
          },
        },
      ],
      clientCidrBlock: '10.100.0.0/16',
      connectionLogOptions: {
        enabled: false,
      },
      serverCertificateArn: certificateArn,
      description: `${projectName}-client-vpn-endpoint`,
      dnsServers: ['10.0.0.2'],
      splitTunnel: false,
      tagSpecifications: [
        {
          resourceType: 'client-vpn-endpoint',
          tags: [
            {
              key: 'Name',
              value: `${projectName}-client-vpn-endpoint`,
            },
          ],
        },
      ],
      vpcId: props.vpc.ref,
    });

    // Client VPN Target Network Association
    const targetNetworkAssociation = new ec2.CfnClientVpnTargetNetworkAssociation(
      this,
      `${projectName}-client-vpn-target-network-association`,
      {
        clientVpnEndpointId: vpnEndpoint.ref,
        subnetId: props.publicSubnet.subnetId,
      }
    );

    // Client VPN Authorization Rule
    new ec2.CfnClientVpnAuthorizationRule(this, `${projectName}-client-vpn-authorization-rule`, {
      clientVpnEndpointId: vpnEndpoint.ref,
      targetNetworkCidr: '10.0.0.0/16',
      authorizeAllGroups: true,
      description: `${projectName}-client-vpn-authorization-rule`,
    });

    // Client VPN Route
    const vpnRoute = new ec2.CfnClientVpnRoute(this, `${projectName}-client-vpn-route`, {
      clientVpnEndpointId: vpnEndpoint.ref,
      destinationCidrBlock: '0.0.0.0/0',
      targetVpcSubnetId: props.publicSubnet.subnetId,
      description: `${projectName}-client-vpn-route`,
    });

    // Dependencies
    vpnRoute.addDependency(targetNetworkAssociation);
  }
}
