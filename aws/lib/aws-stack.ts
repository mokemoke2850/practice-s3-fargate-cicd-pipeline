import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcStack } from './Stack/VpcStack';
import { AlbStack } from './Stack/AlbStack';
import { ECRStack } from './Stack/ECRStack';
import { ECSStack } from './Stack/ECSStack';
import { FrontEndStack } from './Stack/FrontEndStack';

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケットとCloudfront
    const frontend = new FrontEndStack(this, 'frontend-stack');
    const frontendURL = frontend.frontendURL;

    // ECS配置用VPC
    const vpc = new VpcStack(this, 'ecs-vpc-stack');

    // ECS用ALB
    const alb = new AlbStack(this, 'ecs-alb-stack', { vpc: vpc.vpc });

    // バックエンド用ECR
    const repository = new ECRStack(this, 'ecr-stack');

    // バックエンド用Fargate
    const ecs = new ECSStack(this, 'ecs-fargate-stack', {
      vpc: vpc.vpc,
      alb: alb.alb,
      backendRepository: repository.backendRepository,
      simulationRepository: repository.simulationRepository,
      frontendURL: frontendURL,
    });

    new cdk.CfnOutput(this, 'S3Domain', {
      value: frontendURL,
    });

    new cdk.CfnOutput(this, 'ALBDomain', {
      value: `http://${alb.alb.loadBalancerDnsName}`,
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: `${ecs.ecsService.taskDefinition.taskDefinitionArn}`,
    });
  }
}
