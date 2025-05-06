"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dynamodbService_1 = require("../services/dynamodbService");
const handler = async (event) => {
    try {
        // Get all tasks from DynamoDB
        const tasks = await dynamodbService_1.dynamoDBService.listTasks();
        // Return success response with tasks array
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tasks)
        };
    }
    catch (error) {
        console.error('Error listing tasks:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
exports.handler = handler;
