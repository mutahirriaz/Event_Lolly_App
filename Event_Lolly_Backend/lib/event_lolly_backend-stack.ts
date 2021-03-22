import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import * as targets from "@aws-cdk/aws-events-targets";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cognito from "@aws-cdk/aws-cognito";
import { requestTemplate, responseTemplate } from '../utils/appsync-request-response';

export class EventLollyBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const userPool = new cognito.UserPool(this, "awsPool", {
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "verify your email",
        emailBody: "Thankyou for signing up! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: {
        username: true,
        email: true
      },

      autoVerify: {email: true},
      signInCaseSensitive: false,

      standardAttributes:{
        fullname:{
          required: true,
          mutable: true,
        },
        email: {
          required: true,
          mutable: false,
        },
      },

      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

    });

    const client = new cognito.UserPoolClient(this,"app-client", {
      userPool: userPool,
      generateSecret: true,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
        callbackUrls: [`http://localhost:8000/createNew`],
        logoutUrls: [`http://localhost:8000`],
      },
    });

    const domain = userPool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: "lolly-app"
      },
    });

    const signInUrl = domain.signInUrl(client, {
      redirectUri: `http://localhost:8000/createNew`,  // must be a URL configured under 'callbackUrls' with the client
    });

    const api = new appsync.GraphqlApi(this, "LollyApi", {
      name: "LollyEventApi",
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY
        },
      },
      xrayEnabled: true,
    });
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsEventLolly",
        description: "Appsync To Event Bridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );

    events.EventBus.grantAllPutEvents(httpDs);

    const lollyLambda = new lambda.Function(this, "lollyLambda", {
      code: lambda.Code.fromAsset("function"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
    });

    const mutations = ["addLolly"]

    mutations.forEach((mut) => {

      if (mut === "addLolly") {
        let details = `\\\"flavourTop\\\": \\\"$ctx.arguments.flavourTop\\\",\\\"flavourMiddle\\\": \\\"$ctx.arguments.flavourMiddle\\\",\\\"flavourBottom\\\": \\\"$ctx.arguments.flavourBottom\\\",\\\"message\\\": \\\"$ctx.arguments.message\\\",\\\"recipientName\\\": \\\"$ctx.arguments.recipientName\\\",\\\"senderName\\\": \\\"$ctx.arguments.senderName\\\",\\\"lollyPath\\\": \\\"$ctx.arguments.lollyPath\\\"`

        const addLollyResolver = httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addLolly",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });

      }

    });

    // Dynamodb Table
    const dynamodbTable = new dynamodb.Table(this, "EventLollyTable", {
      tableName: "addLollyEvent",
      partitionKey: {
        name: "lollyPath",
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    dynamodbTable.grantFullAccess(lollyLambda);
    lollyLambda.addEnvironment('ADDLOLLY_EVENT', dynamodbTable.tableName);

    const datasource = api.addDynamoDbDataSource("appSyncDatasource", dynamodbTable);

    datasource.createResolver({
      typeName: "Query",
      fieldName: "getLolly",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem("lollyPath" , "lollyPath"),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    })

    // RULE ON DEFAULT EVENT BUS TO TARGET todoLambda LAMBDA
    const rule = new events.Rule(this, "LollyEventRule", {
      eventPattern: {
        source: ["eru-lolly-events"],
        detailType: ["addLolly"]
      },
    });

    rule.addTarget(new targets.LambdaFunction(lollyLambda))


  }
}
