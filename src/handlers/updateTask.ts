import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { dynamoDBService } from "../services/dynamodbService";
import { TaskUpdate, TASK_STATUSES } from "../models/task";

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

        // Get existing task
        const existingTask = await dynamoDBService.getTask(taskId);
        if (!existingTask) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }   

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Request body is required' })
            };
        }

        const updateData: TaskUpdate = JSON.parse(event.body);

        // Use the centralized TASK_STATUSES array from the model to validate the status
        if (updateData.status && !TASK_STATUSES.includes(updateData.status)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    message: 'Invalid status',
                    validValues: TASK_STATUSES 
                })
            };
        }

        // Update task
        const updatedTask = await dynamoDBService.updateTask(taskId, updateData);

        // Return updated task
        return {
            statusCode: 200,
            body: JSON.stringify(updatedTask)
        };
    } catch (error) {
        console.error('Error updating task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};