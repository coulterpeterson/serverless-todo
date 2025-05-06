import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDBService } from '../services/dynamodbService';
import { corsHeaders, handleOptions } from '../utils/corsHeaders';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return handleOptions();
    }

    try {
        // Get all tasks from DynamoDB
        const tasks = await dynamoDBService.listTasks();

        // Return success response with tasks array
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(tasks)
        };
    } catch (error) {
        console.error('Error listing tasks:', error);   
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}