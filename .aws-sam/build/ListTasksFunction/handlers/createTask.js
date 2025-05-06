"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodbService_1 = require("../services/dynamodbService");
const handler = async (event) => {
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
        const taskInput = JSON.parse(event.body);
        // Validate required fields
        if (!taskInput.title) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Title is required' })
            };
        }
        if (!taskInput.status || !['pending', 'in-progress', 'completed'].includes(taskInput.status)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Invalid status' })
            };
        }
        // Create task
        const task = await dynamodbService_1.dynamoDBService.createTask(taskInput);
        // Return success response
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        };
    }
    catch (error) {
        console.error('Error creating task:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
exports.handler = handler;
