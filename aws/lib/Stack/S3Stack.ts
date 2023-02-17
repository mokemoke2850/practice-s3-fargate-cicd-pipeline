import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class S3Stack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // フロントエンド用ファイル格納用 S3 バケット
    this.bucket = new s3.Bucket(scope, 'frontend-s3-bucket', {
      bucketName: 'react-cicd-test-cjadiop',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '/index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // バケットポリシー　これがないとサイト表示できない
    const webSiteBucketPolicyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      resources: [`${this.bucket.bucketArn}/*`],
    });

    this.bucket.addToResourcePolicy(webSiteBucketPolicyStatement);
  }
}
