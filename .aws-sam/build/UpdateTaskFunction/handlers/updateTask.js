"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodbService_1 = require("../services/dynamodbService");
const task_1 = require("../models/task");
const handler = async (event) => {
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
        const existingTask = await dynamodbService_1.dynamoDBService.getTask(taskId);
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
        const updateData = JSON.parse(event.body);
        // Use the centralized TASK_STATUSES array from the model to validate the status
        if (updateData.status && !task_1.TASK_STATUSES.includes(updateData.status)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid status',
                    validValues: task_1.TASK_STATUSES
                })
            };
        }
        // Update task
        const updatedTask = await dynamodbService_1.dynamoDBService.updateTask(taskId, updateData);
        // Return updated task
        return {
            statusCode: 200,
            body: JSON.stringify(updatedTask)
        };
    }
    catch (error) {
        console.error('Error updating task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
exports.handler = handler;
