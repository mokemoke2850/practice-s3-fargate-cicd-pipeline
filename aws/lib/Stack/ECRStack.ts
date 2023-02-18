import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import path = require('path');
import * as imagedeploy from 'cdk-docker-image-deployment';

export class ECRStack extends cdk.Stack {
  public readonly backendRepository: ecr.IRepository;
  public readonly simulationRepository: ecr.IRepository;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // API用ECR
    this.backendRepository = new ecr.Repository(this, 'backend-repository', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      repositoryName: 'github-actions-test',
    });

    // 作成したAPI用ECRへイメージをプッシュ;
    new imagedeploy.DockerImageDeployment(this, 'initial-image-push', {
      source: imagedeploy.Source.directory(
        path.join(__dirname, '../../../', 'backend')
      ),
      destination: imagedeploy.Destination.ecr(this.backendRepository, {
        tag: 'latest',
      }),
    });

    // シミュレーション用ECR
    this.simulationRepository = new ecr.Repository(
      this,
      'simulation-repository',
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        repositoryName: 'github-actions-test-simulation',
      }
    );

    // 作成したシミュレーション用ECRへイメージをプッシュ;
    new imagedeploy.DockerImageDeployment(
      this,
      'initial-simulation-image-push',
      {
        source: imagedeploy.Source.directory(
          path.join(__dirname, '../../../', 'simulation')
        ),
        destination: imagedeploy.Destination.ecr(this.simulationRepository, {
          tag: 'latest',
        }),
      }
    );
  }
}
