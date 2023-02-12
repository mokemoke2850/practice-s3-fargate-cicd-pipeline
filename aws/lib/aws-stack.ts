import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { S3Stack } from './Stack/S3Stack';
import { VpcStack } from './Stack/VpcStack';

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // フロントエンド用バケット
    const frontendBucket = new S3Stack(this, 'frontend-stack', props);

    // ECS配置用VPC
    const vpc = new VpcStack(this, 'ecs-vpc-stack', props);

    new cdk.CfnOutput(this, 'S3Domain', {
      value: `http://${frontendBucket.bucket.bucketDomainName}`,
    });
  }
}
