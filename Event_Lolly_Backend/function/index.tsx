import { EventBridgeEvent, Context } from 'aws-lambda';
import { randomBytes } from 'crypto';
import * as AWS from 'aws-sdk';
import {Lolly} from "./Lolly"
const dynamoClient = new AWS.DynamoDB.DocumentClient();

interface Params {
    TableName : string | ""
    Item: Lolly
}

exports.handler = async (event: EventBridgeEvent<string, any>, context: Context ) => {

    try{

        if(event["detail-type"] === "addLolly"){

            const params: Params = {
                TableName: process.env.ADDLOLLY_EVENT || "",
                Item: {
                    flavourTop: event.detail.flavourTop,
                    flavourMiddle: event.detail.flavourMiddle,
                    flavourBottom: event.detail.flavourBottom,
                    message: event.detail.message,
                    recipientName: event.detail.recipientName,
                    senderName: event.detail.senderName,
                    lollyPath: event.detail.lollyPath
                },
                
            };
            await dynamoClient.put(params).promise()
            
            
        }
        
    }
    catch(err){
        console.log("Error", err)
    }

}