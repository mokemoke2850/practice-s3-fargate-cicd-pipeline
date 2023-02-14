import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { S3Stack } from './Stack/S3Stack';
import { VpcStack } from './Stack/VpcStack';
import { AlbStack } from './Stack/AlbStack';
import { ECRStack } from './Stack/ECRStack';
import * as imagedeploy from 'cdk-docker-image-deployment';
import { EcsTask } from 'aws-cdk-lib/aws-events-targets';
import { ECSStack } from './Stack/ECSStack';
import path = require('path');
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // フロントエンド用バケット
    const frontendBucket = new S3Stack(this, 'frontend-stack', props);
    const frontendURL = `http://${frontendBucket.bucket.bucketDomainName}`;

    // ECS配置用VPC
    const vpc = new VpcStack(this, 'ecs-vpc-stack', props);

    // ECS用ALB
    const alb = new AlbStack(this, 'ecs-alb-stack', vpc.vpc, props);

    const testrepository = ecr.Repository.fromRepositoryName(
      this,
      'test-repository',
      'hogehoge'
    );

    // バックエンド用ECR
    const repository = new ECRStack(this, 'ecr-stack', props);

    // バックエンド用Fargate
    const ecs = new ECSStack(
      this,
      'ecs-fargate-stack',
      vpc.vpc,
      alb.alb,
      repository.repository,
      frontendURL,
      props
    );

    new cdk.CfnOutput(this, 'S3Domain', {
      value: frontendURL,
    });

    new cdk.CfnOutput(this, 'ALBDomain', {
      value: `http://${alb.alb.loadBalancerDnsName}`,
    });
  }
}
