"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodbService_1 = require("../services/dynamodbService");
const task_1 = require("../models/task");
const corsHeaders_1 = require("../utils/corsHeaders");
const handler = async (event) => {
    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return (0, corsHeaders_1.handleOptions)();
    }
    try {
        const taskId = event.pathParameters?.taskId;
        // Ensure taskId is provided
        if (!taskId) {
            return {
                statusCode: 400,
                headers: corsHeaders_1.corsHeaders,
                body: JSON.stringify({ message: 'Task ID is required' })
            };
        }
        // Get existing task
        const existingTask = await dynamodbService_1.dynamoDBService.getTask(taskId);
        if (!existingTask) {
            return {
                statusCode: 404,
                headers: corsHeaders_1.corsHeaders,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders_1.corsHeaders,
                body: JSON.stringify({ message: 'Request body is required' })
            };
        }
        const updateData = JSON.parse(event.body);
        // Use the centralized TASK_STATUSES array from the model to validate the status
        if (updateData.status && !task_1.TASK_STATUSES.includes(updateData.status)) {
            return {
                statusCode: 400,
                headers: corsHeaders_1.corsHeaders,
                body: JSON.stringify({
                    message: 'Invalid status',
                    validValues: task_1.TASK_STATUSES
                })
            };
        }
        // First create a local copy of what the updated task will look like
        const locallyUpdatedTask = dynamodbService_1.dynamoDBService.updateTaskLocally(existingTask, updateData);
        // Then perform the actual update in the database (in the background)
        await dynamodbService_1.dynamoDBService.updateTask(taskId, updateData);
        // Return the locally updated task, which matches what will eventually be in the database
        return {
            statusCode: 200,
            headers: corsHeaders_1.corsHeaders,
            body: JSON.stringify(locallyUpdatedTask)
        };
    }
    catch (error) {
        console.error('Error updating task:', error);
        return {
            statusCode: 500,
            headers: corsHeaders_1.corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
exports.handler = handler;
