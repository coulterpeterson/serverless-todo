"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodbService_1 = require("../services/dynamodbService");
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
        // Check if task exists
        const taskExists = await dynamodbService_1.dynamoDBService.getTask(taskId);
        if (!taskExists) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }
        // Delete task
        await dynamodbService_1.dynamoDBService.deleteTask(taskId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task deleted successfully' })
        };
    }
    catch (error) {
        console.error('Error deleting task:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
exports.handler = handler;
