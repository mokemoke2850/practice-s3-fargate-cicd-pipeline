import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CloudFrontStack extends cdk.Stack {
  public readonly cloudfront: cloudfront.CloudFrontWebDistribution;
  public readonly oai: cloudfront.OriginAccessIdentity;
  public readonly url: string;
  constructor(
    scope: Construct,
    id: string,
    bucket: s3.Bucket,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    this.oai = new cloudfront.OriginAccessIdentity(
      this,
      'origin-access-identity',
      {
        comment: `${bucket.bucketName} access identity`,
      }
    );
    // S3バケットのOAIポリシー追加、CloudFront内でやると循環参照が起きる。
    const bucketPolicyStatement = new iam.PolicyStatement({
      sid: `Get ${bucket.bucketName} Object`,
      effect: iam.Effect.ALLOW,
      principals: [this.oai.grantPrincipal],
      actions: ['s3:GetObject'],
      resources: [`${bucket.bucketArn}/*`],
    });
    bucket.addToResourcePolicy(bucketPolicyStatement);

    this.cloudfront = new cloudfront.CloudFrontWebDistribution(
      this,
      'web-distribution',
      {
        enableIpV6: true,
        httpVersion: cloudfront.HttpVersion.HTTP2,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: this.oai,
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

    this.url = `https://${this.cloudfront.distributionDomainName}`;
  }
}
