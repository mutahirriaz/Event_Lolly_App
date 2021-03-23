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
