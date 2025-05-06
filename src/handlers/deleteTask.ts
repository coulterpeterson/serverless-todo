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

        // Check if task exists
        const taskExists = await dynamoDBService.getTask(taskId);
        if (!taskExists) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }

        // Delete task
        await dynamoDBService.deleteTask(taskId);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Task deleted successfully' })
        };
    } catch (error) {
        console.error('Error deleting task:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
    