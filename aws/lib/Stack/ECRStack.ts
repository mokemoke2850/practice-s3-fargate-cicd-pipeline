import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import path = require('path');
import * as imagedeploy from 'cdk-docker-image-deployment';

export class ECRStack extends cdk.Stack {
  public readonly repository: ecr.IRepository;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, 'backend-repository', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      repositoryName: 'github-actions-test',
    });

    // 作成したECRへイメージをプッシュ;
    new imagedeploy.DockerImageDeployment(this, 'initial-image-push', {
      source: imagedeploy.Source.directory(
        path.join(__dirname, '../../../', 'backend')
      ),
      destination: imagedeploy.Destination.ecr(this.repository, {
        tag: 'latest',
      }),
    });
  }
}
