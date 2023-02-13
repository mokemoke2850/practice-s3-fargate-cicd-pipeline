import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class ECRStack extends cdk.Stack {
  public readonly repository: ecr.Repository;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(scope, 'backend-repository', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      repositoryName: 'github-actions-test',
    });
  }
}
