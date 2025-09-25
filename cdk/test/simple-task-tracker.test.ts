import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as SimpleTaskTracker from '../lib/simple-task-tracker-stack';

describe('SimpleTaskTrackerStack', () => {
    let app: cdk.App;
    let stack: SimpleTaskTracker.SimpleTaskTrackerStack;
    let template: Template;

    beforeEach(() => {
        app = new cdk.App();
        stack = new SimpleTaskTracker.SimpleTaskTrackerStack(app, 'MyTestStack', {
            environment: 'test',
        });
        template = Template.fromStack(stack);
    });

    test('S3 Bucket Created', () => {
        template.hasResourceProperties('AWS::S3::Bucket', {
            WebsiteConfiguration: {
                IndexDocument: 'index.html',
                ErrorDocument: 'index.html',
            },
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
                BlockPublicPolicy: true,
                IgnorePublicAcls: true,
                RestrictPublicBuckets: true,
            },
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                    {
                        ServerSideEncryptionByDefault: {
                            SSEAlgorithm: 'AES256',
                        },
                    },
                ],
            },
        });
    });

    test('CloudFront Distribution Created', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
            DistributionConfig: {
                DefaultRootObject: 'simple-task-tracker-standalone.html',
                Enabled: true,
                HttpVersion: 'http2and3',
                PriceClass: 'PriceClass_100',
            },
        });
    });

    test('Origin Access Control Created', () => {
        template.hasResourceProperties('AWS::CloudFront::OriginAccessControl', {
            OriginAccessControlConfig: {
                OriginAccessControlOriginType: 's3',
                SigningBehavior: 'always',
                SigningProtocol: 'sigv4',
            },
        });
    });

    test('S3 Bucket Policy Created', () => {
        template.hasResource('AWS::S3::BucketPolicy', {});
    });

    test('Error Responses Configured', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
            DistributionConfig: {
                CustomErrorResponses: [
                    {
                        ErrorCode: 404,
                        ResponseCode: 200,
                        ResponsePagePath: '/simple-task-tracker-standalone.html',
                        ErrorCachingMinTTL: 300,
                    },
                    {
                        ErrorCode: 403,
                        ResponseCode: 200,
                        ResponsePagePath: '/simple-task-tracker-standalone.html',
                        ErrorCachingMinTTL: 300,
                    },
                ],
            },
        });
    });

    test('Outputs Created', () => {
        template.hasOutput('WebsiteURL', {});
        template.hasOutput('DistributionId', {});
        template.hasOutput('BucketName', {});
        template.hasOutput('DistributionDomainName', {});
    });

    test('Security Headers Applied', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
            DistributionConfig: {
                DefaultCacheBehavior: {
                    ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03',
                },
            },
        });
    });

    test('Compression Enabled', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
            DistributionConfig: {
                DefaultCacheBehavior: {
                    Compress: true,
                },
            },
        });
    });
});

describe('SimpleTaskTrackerStack with Custom Domain', () => {
    let app: cdk.App;
    let stack: SimpleTaskTracker.SimpleTaskTrackerStack;
    let template: Template;

    beforeEach(() => {
        app = new cdk.App();
        stack = new SimpleTaskTracker.SimpleTaskTrackerStack(app, 'MyTestStackWithDomain', {
            environment: 'production',
            domainName: 'task-tracker.example.com',
            hostedZoneId: 'Z1234567890ABC',
        });
        template = Template.fromStack(stack);
    });

    test('Certificate Created for Custom Domain', () => {
        template.hasResourceProperties('AWS::CertificateManager::Certificate', {
            DomainName: 'task-tracker.example.com',
            ValidationMethod: 'DNS',
        });
    });

    test('Route53 Record Created', () => {
        template.hasResourceProperties('AWS::Route53::RecordSet', {
            Type: 'A',
            Name: 'task-tracker.example.com.',
            HostedZoneId: 'Z1234567890ABC',
        });
    });

    test('CloudFront Distribution with Custom Domain', () => {
        template.hasResourceProperties('AWS::CloudFront::Distribution', {
            DistributionConfig: {
                Aliases: ['task-tracker.example.com'],
                ViewerCertificate: {
                    SslSupportMethod: 'sni-only',
                    MinimumProtocolVersion: 'TLSv1.2_2021',
                },
            },
        });
    });
});