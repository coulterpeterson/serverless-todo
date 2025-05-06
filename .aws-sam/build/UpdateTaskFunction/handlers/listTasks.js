"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodbService_1 = require("../services/dynamodbService");
const corsHeaders_1 = require("../utils/corsHeaders");
const handler = async (event) => {
    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return (0, corsHeaders_1.handleOptions)();
    }
    try {
        // Get all tasks from DynamoDB
        const tasks = await dynamodbService_1.dynamoDBService.listTasks();
        // Return success response with tasks array
        return {
            statusCode: 200,
            headers: corsHeaders_1.corsHeaders,
            body: JSON.stringify(tasks)
        };
    }
    catch (error) {
        console.error('Error listing tasks:', error);
        return {
            statusCode: 500,
            headers: corsHeaders_1.corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
exports.handler = handler;
