import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class ECSStack extends cdk.Stack {
  public readonly ecsService: ecsp.ApplicationLoadBalancedFargateService;

  constructor(
    scope: cdk.Stack,
    id: string,
    vpc: cdk.aws_ec2.Vpc,
    alb: cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer,
    repository: cdk.aws_ecr.IRepository,
    frontendURL: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const ecsCluster = new ecs.Cluster(scope, 'backend-api-ecs-cluster', {
      clusterName: 'github-actions-test-cluster',
      vpc: vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      scope,
      'backend-api-fargate-task',
      {
        cpu: 256,
        memoryLimitMiB: 512,
      }
    );
    taskDefinition.addContainer('backend-api-container', {
      containerName: 'backend-api',
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      portMappings: [{ containerPort: 80, hostPort: 80 }],
      environment: {
        FRONTEND_URL: frontendURL,
        API_ENV: 'production',
        API_PORT: '80',
      },
      healthCheck: {
        command: [
          'CMD-SHELL',
          'curl -f http://localhost:80/ishealthy || exit 1',
        ],
      },
    });

    this.ecsService = new ecsp.ApplicationLoadBalancedFargateService(
      scope,
      'ecsp-alb-fargate',
      {
        cluster: ecsCluster,
        taskDefinition,
        serviceName: 'github-actions-test-service',
        loadBalancer: alb,
        desiredCount: 1,
        taskSubnets: vpc.selectSubnets({
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }),
      }
    );

    // ALBのヘルスチェックURLパスを/ishealthyに変更する
    this.ecsService.targetGroup.configureHealthCheck({
      path: '/ishealthy',
      port: '80',
      protocol: elbv2.Protocol.HTTP,
    });
  }
}
