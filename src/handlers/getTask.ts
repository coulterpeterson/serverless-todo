import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { dynamoDBService } from "../services/dynamodbService";
import { corsHeaders, handleOptions } from '../utils/corsHeaders';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return handleOptions();
    }

    try {
        const taskId = event.pathParameters?.taskId;

        // Ensure taskId is provided
        if (!taskId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Task ID is required' })
            };
        }

        // Get task
        const task = await dynamoDBService.getTask(taskId);
        if (!task) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }

        // Return task
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(task)
        };      
    } catch (error) {
        console.error('Error getting task:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};