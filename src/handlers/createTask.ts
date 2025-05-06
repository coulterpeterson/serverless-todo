import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDBService } from '../services/dynamodbService';
import { TASK_STATUSES, TaskInput } from '../models/task';
import { corsHeaders, handleOptions } from '../utils/corsHeaders';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return handleOptions();
    }

    try {
        // Validate request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Request body is required' })
            };
        }

        // Parse request body
        const taskInput: TaskInput = JSON.parse(event.body);

        // Validate required fields
        if (!taskInput.title) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Title is required' })
            };
        }

         // Use the centralized TASK_STATUSES array from the model to validate the status
        if (!taskInput.status || !TASK_STATUSES.includes(taskInput.status)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
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
            headers: corsHeaders,
            body: JSON.stringify(task)
        };
    } catch (error) {
        console.error('Error creating task:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}