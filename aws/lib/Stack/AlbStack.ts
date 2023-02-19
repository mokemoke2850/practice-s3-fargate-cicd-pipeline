import * as cdk from 'aws-cdk-lib';
import * as elb2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface AlbStackProps {
  vpc: ec2.IVpc;
}

/**
 * ECS用ALB
 * ターゲットグループとリスナーは ECS 作成時に自動設定されるので明示的には作成しない
 */
export class AlbStack extends cdk.Stack {
  public readonly alb: elb2.ApplicationLoadBalancer;
  constructor(scope: cdk.Stack, id: string, props: AlbStackProps) {
    super(scope, id);
    const { vpc } = props;

    // ALB用のセキュリティグループ
    const albSecurityGroup = new ec2.SecurityGroup(
      scope,
      'http-from-anywhere-security-group',
      {
        vpc,
        securityGroupName: 'ecs-alb-security-group',
      }
    );
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    albSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic());

    this.alb = new elb2.ApplicationLoadBalancer(scope, 'ecs-alb', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'ecs-alb',
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PUBLIC,
      }),
      securityGroup: albSecurityGroup,
    });
    this.alb.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
