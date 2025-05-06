import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { dynamoDBService } from "../services/dynamodbService";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const taskId = event.pathParameters?.taskId;

        // Ensure taskId is provided
        if (!taskId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Task ID is required' })
            };
        }

        // Get task
        const task = await dynamoDBService.getTask(taskId);
        if (!task) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }

        // Return task
        return {
            statusCode: 200,
            body: JSON.stringify(task)
        };      
    } catch (error) {
        console.error('Error getting task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};