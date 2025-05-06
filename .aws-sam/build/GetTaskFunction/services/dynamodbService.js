"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoDBService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
class DynamoDBService {
    constructor() {
        // Check if running locally with SAM
        this.isLocal = process.env.AWS_SAM_LOCAL === 'true';
        // Configure DynamoDB client based on environment
        const options = this.isLocal
            ? {
                // Use local DynamoDB when running with SAM local
                endpoint: 'http://host.docker.internal:8000', // For Mac/Windows 
                // If on Linux, use: 'http://172.17.0.1:8000'
                region: 'local-env',
                credentials: {
                    accessKeyId: 'dummy',
                    secretAccessKey: 'dummy'
                }
            }
            : {}; // Use default config in AWS environment
        this.ddbClient = new client_dynamodb_1.DynamoDBClient(options);
        this.client = lib_dynamodb_1.DynamoDBDocumentClient.from(this.ddbClient);
        this.tableName = process.env.TASKS_TABLE || 'Tasks';
    }
    // This method can be called explicitly before operations
    async ensureTableExists() {
        if (!this.isLocal)
            return; // Only needed for local dev
        try {
            console.log(`Checking if table ${this.tableName} exists...`);
            // Try to create the table
            const createTableCommand = new client_dynamodb_1.CreateTableCommand({
                TableName: this.tableName,
                KeySchema: [
                    { AttributeName: 'taskId', KeyType: 'HASH' }
                ],
                AttributeDefinitions: [
                    { AttributeName: 'taskId', AttributeType: 'S' }
                ],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            });
            await this.ddbClient.send(createTableCommand);
            console.log(`Created table ${this.tableName}`);
        }
        catch (err) {
            // Ignore if table already exists
            if (err.name === 'ResourceInUseException') {
                console.log(`Table ${this.tableName} already exists`);
            }
            else {
                console.warn('Error creating table:', err);
                // Don't throw - this is a setup operation
            }
        }
    }
    async createTask(taskInput) {
        // Ensure table exists before operations
        await this.ensureTableExists();
        const now = new Date().toISOString();
        const task = {
            taskId: (0, uuid_1.v4)(),
            title: taskInput.title,
            description: taskInput.description || '',
            status: taskInput.status,
            createdAt: now,
            updatedAt: now,
        };
        await this.client.send(new lib_dynamodb_1.PutCommand({
            TableName: this.tableName,
            Item: task
        }));
        return task;
    }
    async getTask(taskId) {
        // Ensure table exists before operations
        await this.ensureTableExists();
        const response = await this.client.send(new lib_dynamodb_1.GetCommand({
            TableName: this.tableName,
            Key: { taskId },
        }));
        return response.Item;
    }
    async updateTask(taskId, updates) {
        // Ensure table exists before operations
        await this.ensureTableExists();
        const existingTask = await this.getTask(taskId);
        if (!existingTask) {
            return null;
        }
        const now = new Date().toISOString();
        // ------------------------------------------------------------
        // Build the update expression dynamically
        // ------------------------------------------------------------
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
        // Always update the updatedAt field
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = now;
        // ------------------------------------------------------------
        // Add updates for each field if provided:
        // ------------------------------------------------------------
        if (updates.title !== undefined) {
            updateExpressions.push('#title = :title');
            expressionAttributeNames['#title'] = 'title';
            expressionAttributeValues[':title'] = updates.title;
        }
        if (updates.description !== undefined) {
            updateExpressions.push('#description = :description');
            expressionAttributeNames['#description'] = 'description';
            expressionAttributeValues[':description'] = updates.description;
        }
        if (updates.status !== undefined) {
            updateExpressions.push('#status = :status');
            expressionAttributeNames['#status'] = 'status';
            expressionAttributeValues[':status'] = updates.status;
        }
        // ------------------------------------------------------------
        // Build the update command
        // ------------------------------------------------------------
        const response = await this.client.send(new lib_dynamodb_1.UpdateCommand({
            TableName: this.tableName,
            Key: { taskId },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'UPDATED_NEW',
        }));
        return response.Attributes;
    }
    async deleteTask(taskId) {
        // Ensure table exists before operations
        await this.ensureTableExists();
        await this.client.send(new lib_dynamodb_1.DeleteCommand({
            TableName: this.tableName,
            Key: { taskId },
        }));
        return true;
    }
    async listTasks() {
        // Ensure table exists before operations
        await this.ensureTableExists();
        const response = await this.client.send(new lib_dynamodb_1.ScanCommand({
            TableName: this.tableName,
        }));
        return response.Items || [];
    }
}
exports.dynamoDBService = new DynamoDBService();
