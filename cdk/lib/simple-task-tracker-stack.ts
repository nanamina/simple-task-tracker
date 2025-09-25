import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

export interface SimpleTaskTrackerStackProps extends cdk.StackProps {
    /**
     * カスタムドメイン名（オプション）
     * 例: 'task-tracker.example.com'
     */
    domainName?: string;

    /**
     * Route53 ホストゾーンID（カスタムドメイン使用時に必要）
     */
    hostedZoneId?: string;

    /**
     * 環境名（dev, staging, production）
     */
    environment?: string;
}

export class SimpleTaskTrackerStack extends cdk.Stack {
    public readonly bucket: s3.Bucket;
    public readonly distribution: cloudfront.Distribution;
    public readonly domainName: string;

    constructor(scope: Construct, id: string, props?: SimpleTaskTrackerStackProps) {
        super(scope, id, props);

        const environment = props?.environment || 'production';
        const stackName = `simple-task-tracker-${environment}`;

        // S3バケット作成
        this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
            // Let CDK generate unique bucket name automatically

            // 静的ウェブサイトホスティング設定
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html', // SPAの場合は同じファイル

            // パブリックアクセス設定
            publicReadAccess: false, // CloudFront経由でのみアクセス
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

            // セキュリティ設定
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,

            // ライフサイクル設定
            lifecycleRules: [
                {
                    id: 'DeleteIncompleteMultipartUploads',
                    abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
                },
            ],

            // バージョニング（本番環境のみ）
            versioned: environment === 'production',

            // 削除保護
            removalPolicy: environment === 'production'
                ? cdk.RemovalPolicy.RETAIN
                : cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: environment !== 'production',
        });

        // Origin Access Control (OAC) 作成
        const originAccessControl = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
            originAccessControlConfig: {
                description: `OAC for ${stackName}`,
                name: `${stackName}-OAC`,
                originAccessControlOriginType: 's3',
                signingBehavior: 'always',
                signingProtocol: 'sigv4',
            },
        });

        // SSL証明書（カスタムドメイン使用時）
        // CloudFrontで使用するため、us-east-1リージョンに作成する必要がある
        let certificate: acm.Certificate | undefined;
        if (props?.domainName) {
            certificate = new acm.Certificate(this, 'Certificate', {
                domainName: props.domainName,
                validation: acm.CertificateValidation.fromDns(),
            });
        }

        // CloudFront Distribution作成
        this.distribution = new cloudfront.Distribution(this, 'Distribution', {
            comment: `${stackName} - Static Website Distribution`,

            // オリジン設定
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket),

                // キャッシュ設定
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,

                // ビューワープロトコルポリシー
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,

                // 許可するHTTPメソッド
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,

                // 圧縮
                compress: true,
            },

            // デフォルトルートオブジェクト
            defaultRootObject: 'simple-task-tracker-standalone.html',

            // エラーページ設定
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/simple-task-tracker-standalone.html',
                    ttl: cdk.Duration.minutes(5),
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/simple-task-tracker-standalone.html',
                    ttl: cdk.Duration.minutes(5),
                },
            ],

            // SSL証明書とドメイン設定
            domainNames: props?.domainName ? [props.domainName] : undefined,
            certificate: certificate,

            // 価格クラス（コスト最適化）
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // 北米・ヨーロッパのみ

            // HTTP/2サポート
            httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,

            // セキュリティ設定
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,

            // ログ設定（本番環境のみ）
            enableLogging: environment === 'production',
            logBucket: environment === 'production' ? new s3.Bucket(this, 'LogBucket', {
                // Let CDK generate unique bucket name automatically
                encryption: s3.BucketEncryption.S3_MANAGED,
                // Enable ACLs for CloudFront logging
                objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
                publicReadAccess: false,
                blockPublicAccess: new s3.BlockPublicAccess({
                    blockPublicAcls: false,
                    blockPublicPolicy: true,
                    ignorePublicAcls: false,
                    restrictPublicBuckets: true,
                }),
                lifecycleRules: [
                    {
                        id: 'DeleteOldLogs',
                        expiration: cdk.Duration.days(90),
                    },
                ],
                removalPolicy: cdk.RemovalPolicy.DESTROY,
                autoDeleteObjects: true,
            }) : undefined,
        });

        // CloudFrontディストリビューションにOACを設定
        const cfnDistribution = this.distribution.node.defaultChild as cloudfront.CfnDistribution;
        cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', originAccessControl.attrId);
        cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', '');

        // S3バケットポリシー（CloudFrontからのアクセス許可）
        this.bucket.addToResourcePolicy(new iam.PolicyStatement({
            sid: 'AllowCloudFrontServicePrincipal',
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
            actions: ['s3:GetObject'],
            resources: [this.bucket.arnForObjects('*')],
            conditions: {
                StringEquals: {
                    'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
                },
            },
        }));

        // Route53レコード作成（カスタムドメイン使用時）
        if (props?.domainName && props?.hostedZoneId) {
            const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                hostedZoneId: props.hostedZoneId,
                zoneName: props.domainName.split('.').slice(-2).join('.'), // ルートドメイン取得
            });

            new route53.ARecord(this, 'AliasRecord', {
                zone: hostedZone,
                recordName: props.domainName,
                target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
                ttl: cdk.Duration.minutes(5),
            });
        }

        // ファイルデプロイ - Use data strings to avoid file system issues
        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [
                // Deploy from a clean directory with only the web app files
                s3deploy.Source.data('simple-task-tracker-standalone.html',
                    fs.readFileSync(path.join(__dirname, '../../simple-task-tracker-standalone.html'), 'utf8')),
                s3deploy.Source.data('task-tracker-script.js',
                    fs.readFileSync(path.join(__dirname, '../../task-tracker-script.js'), 'utf8')),
                s3deploy.Source.data('task-tracker-styles.css',
                    fs.readFileSync(path.join(__dirname, '../../task-tracker-styles.css'), 'utf8')),
                s3deploy.Source.data('simple-task-tracker.html',
                    fs.readFileSync(path.join(__dirname, '../../simple-task-tracker.html'), 'utf8')),
            ],
            destinationBucket: this.bucket,
            distribution: this.distribution,
            distributionPaths: ['/*'], // 全ファイルのキャッシュを無効化

            // メタデータ設定
            metadata: {
                'Cache-Control': 'public, max-age=31536000', // 1年間キャッシュ
            },

            // コンテンツタイプ設定
            contentLanguage: 'ja',
        });

        // アウトプット
        this.domainName = props?.domainName || this.distribution.distributionDomainName;

        new cdk.CfnOutput(this, 'WebsiteURL', {
            value: `https://${this.domainName}`,
            description: 'Simple Task Tracker Website URL',
            exportName: `${stackName}-WebsiteURL`,
        });

        new cdk.CfnOutput(this, 'DistributionId', {
            value: this.distribution.distributionId,
            description: 'CloudFront Distribution ID',
            exportName: `${stackName}-DistributionId`,
        });

        new cdk.CfnOutput(this, 'BucketName', {
            value: this.bucket.bucketName,
            description: 'S3 Bucket Name',
            exportName: `${stackName}-BucketName`,
        });

        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: this.distribution.distributionDomainName,
            description: 'CloudFront Distribution Domain Name',
            exportName: `${stackName}-DistributionDomainName`,
        });
    }
}