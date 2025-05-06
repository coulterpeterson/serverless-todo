import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDBService } from '../services/dynamodbService';
import { TASK_STATUSES, TaskInput } from '../models/task';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Validate request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Request body is required' })
            };
        }

        // Parse request body
        const taskInput: TaskInput = JSON.parse(event.body);

        // Validate required fields
        if (!taskInput.title) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Title is required' })
            };
        }

         // Use the centralized TASK_STATUSES array from the model to validate the status
        if (!taskInput.status || !TASK_STATUSES.includes(taskInput.status)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: 'Invalid status',  
                    validValues: TASK_STATUSES 
                })
            };
        }

        // Create task
        const task = await dynamoDBService.createTask(taskInput);

        // Return success response
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        };
    } catch (error) {
        console.error('Error creating task:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}