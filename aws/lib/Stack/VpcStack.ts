import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

// ECS用のVPC　ECSのL2コンストラクタでも自動生成されるが、依存性を分けておく
export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * ap-northeast-1a、ap-northeast-1cにパブリック、プライベートサブネットの組を1組ずつ
     * インターネットゲートウェイ*1
     * Natgatewayをそれぞれのパブリックサブネットに1つずつ作成する
     */
    this.vpc = new ec2.Vpc(scope, 'ecs-vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.3.0.0/16'),
      availabilityZones: ['ap-northeast-1a', 'ap-northeast-1c'],
    });

    // プライベートサブネットからS3へ接続できるようにエンドポイントゲートウェイを作成
    this.vpc.addGatewayEndpoint('s3-endpoint-from-private', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
    });
  }
}
