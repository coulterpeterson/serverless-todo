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
        // Validate request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders_1.corsHeaders,
                body: JSON.stringify({ message: 'Request body is required' })
            };
        }
        // Parse request body
        const taskInput = JSON.parse(event.body);
        // Validate required fields
        if (!taskInput.title) {
            return {
                statusCode: 400,
                headers: corsHeaders_1.corsHeaders,
                body: JSON.stringify({ message: 'Title is required' })
            };
        }
        // Use the centralized TASK_STATUSES array from the model to validate the status
        if (!taskInput.status || !task_1.TASK_STATUSES.includes(taskInput.status)) {
            return {
                statusCode: 400,
                headers: corsHeaders_1.corsHeaders,
                body: JSON.stringify({
                    message: 'Invalid status',
                    validValues: task_1.TASK_STATUSES
                })
            };
        }
        // Create task
        const task = await dynamodbService_1.dynamoDBService.createTask(taskInput);
        // Return success response
        return {
            statusCode: 201,
            headers: corsHeaders_1.corsHeaders,
            body: JSON.stringify(task)
        };
    }
    catch (error) {
        console.error('Error creating task:', error);
        return {
            statusCode: 500,
            headers: corsHeaders_1.corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
exports.handler = handler;
