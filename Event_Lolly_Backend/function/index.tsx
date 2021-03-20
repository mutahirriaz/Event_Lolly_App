import { EventBridgeEvent, Context } from 'aws-lambda';
import { randomBytes } from 'crypto';
import * as AWS from 'aws-sdk';
const dynamoClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: EventBridgeEvent<string, any>, context: Context ) => {

    try{

        if(event["detail-type"] === "addLolly"){

            const params = {
                TableName: process.env.ADDLOLLY_EVENT || "",
                Item: {
                    flavourTop: event.detail.flavourTop,
                    flavourMiddle: event.detail.flavourMiddle,
                    flavourBottom: event.detail.flavourBottom,
                    message: event.detail.message,
                    recipientName: event.detail.recipientName,
                    senderName: event.detail.senderName,
                    lollyPath: randomBytes(16).toString("hex")
                },
                
            };
            await dynamoClient.put(params).promise()
            
        }
        
    }
    catch(err){
        console.log("Error", err)
    }

}