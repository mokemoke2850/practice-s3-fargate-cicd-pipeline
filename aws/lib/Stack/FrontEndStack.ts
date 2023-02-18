import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CloudFrontStack } from './CloudFrontStack';

export class FrontEndStack extends cdk.Stack {
  public readonly frontendURL: string;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // フロントエンド用バケット
    const frontendBucket = new s3.Bucket(this, 'frontend-s3-bucket', {
      bucketName: 'react-cicd-test-cjadiop',
      accessControl: s3.BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const oai = new cloudfront.OriginAccessIdentity(
      this,
      'origin-access-identity',
      {
        comment: `${frontendBucket.bucketName} access identity`,
      }
    );

    const bucketPolicyStatement = new iam.PolicyStatement({
      sid: `Get ${frontendBucket.bucketName} Object`,
      effect: iam.Effect.ALLOW,
      principals: [oai.grantPrincipal],
      actions: ['s3:GetObject'],
      resources: [`${frontendBucket.bucketArn}/*`],
    });
    frontendBucket.addToResourcePolicy(bucketPolicyStatement);

    const createdCloudFront = new cloudfront.CloudFrontWebDistribution(
      this,
      'web-distribution',
      {
        enableIpV6: true,
        httpVersion: cloudfront.HttpVersion.HTTP2,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: frontendBucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD,
                cachedMethods:
                  cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD,
                forwardedValues: {
                  queryString: false,
                },
              },
            ],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 403,
            responseCode: 200,
            errorCachingMinTtl: 0,
            responsePagePath: '/index.html',
          },
          {
            errorCode: 404,
            responseCode: 200,
            errorCachingMinTtl: 0,
            responsePagePath: '/index.html',
          },
        ],
      }
    );
    this.frontendURL = `https://${createdCloudFront.distributionDomainName}`;
  }
}
