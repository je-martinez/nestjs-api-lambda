import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as signer from 'aws-cdk-lib/aws-signer';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as restApi from 'aws-cdk-lib/aws-apigateway';

export class FakeCdkProjectStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const signingProfile = new signer.SigningProfile(this, 'SigningProfile', {
      platform: signer.Platform.AWS_LAMBDA_SHA384_ECDSA,
    });

    const codeSigningConfig = new lambda.CodeSigningConfig(
      this,
      'CodeSigningConfig',
      {
        signingProfiles: [signingProfile],
      },
    );

    const apiNestHandlerFunction = new lambda.Function(this, 'NestJsLambda', {
      codeSigningConfig,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../dist')),
    });

    const api = new restApi.RestApi(this, 'NestJsLambdaApi', {
      deploy: true,
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });

    api.root.addProxy({
      defaultIntegration: new restApi.LambdaIntegration(
        apiNestHandlerFunction,
        {
          proxy: true,
        },
      ),
    });
    const apiKey = api.addApiKey('ApiKey');
    const usagePlan = api.addUsagePlan('UsagePlan', {
      name: 'UsagePlan',
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });
    usagePlan.addApiKey(apiKey);
  }
}
