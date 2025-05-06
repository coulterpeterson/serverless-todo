import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { dynamoDBService } from "../services/dynamodbService";
import { TaskUpdate, TASK_STATUSES } from "../models/task";
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

        // Get existing task
        const existingTask = await dynamoDBService.getTask(taskId);
        if (!existingTask) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }   

        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Request body is required' })
            };
        }

        const updateData: TaskUpdate = JSON.parse(event.body);

        // Use the centralized TASK_STATUSES array from the model to validate the status
        if (updateData.status && !TASK_STATUSES.includes(updateData.status)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    message: 'Invalid status',
                    validValues: TASK_STATUSES 
                })
            };
        }

        // First create a local copy of what the updated task will look like
        const locallyUpdatedTask = dynamoDBService.updateTaskLocally(existingTask, updateData);
        
        // Then perform the actual update in the database (in the background)
        await dynamoDBService.updateTask(taskId, updateData);

        // Return the locally updated task, which matches what will eventually be in the database
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(locallyUpdatedTask)
        };
    } catch (error) {
        console.error('Error updating task:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};