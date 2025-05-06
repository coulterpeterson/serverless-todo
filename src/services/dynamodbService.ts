import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Task, TaskInput, TaskUpdate } from "../models/task";

class DynamoDBService {
    private readonly client: DynamoDBDocumentClient;
    private readonly ddbClient: DynamoDBClient;
    private readonly tableName: string;
    private readonly isLocal: boolean;

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
            
        this.ddbClient = new DynamoDBClient(options);
        this.client = DynamoDBDocumentClient.from(this.ddbClient);
        this.tableName = process.env.TASKS_TABLE || 'Tasks';
    }
    
    // This method can be called explicitly before operations
    async ensureTableExists(): Promise<void> {
        if (!this.isLocal) return; // Only needed for local dev
        
        try {
            console.log(`Checking if table ${this.tableName} exists...`);
            
            // Try to create the table
            const createTableCommand = new CreateTableCommand({
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
        } catch (err: any) {
            // Ignore if table already exists
            if (err.name === 'ResourceInUseException') {
                console.log(`Table ${this.tableName} already exists`);
            } else {
                console.warn('Error creating table:', err);
                // Don't throw - this is a setup operation
            }
        }
    }

    async createTask(taskInput: TaskInput): Promise<Task> {
        // Ensure table exists before operations
        await this.ensureTableExists();
        
        const now = new Date().toISOString();

        const task: Task = {
            taskId: uuidv4(),
            title: taskInput.title,
            description: taskInput.description || '',
            status: taskInput.status,
            createdAt: now,
            updatedAt: now,
        };

        await this.client.send(new PutCommand({
            TableName: this.tableName,
            Item: task
        }));

        return task;
    }

    async getTask(taskId: string): Promise<Task | null> {
        // Ensure table exists before operations
        await this.ensureTableExists();
        
        const response = await this.client.send(new GetCommand({
            TableName: this.tableName,
            Key: { taskId },
        }));

        return response.Item as Task | null;
    }

    // Apply updates to a task object without persisting to the database
    updateTaskLocally(task: Task, updates: TaskUpdate): Task {
        const now = new Date().toISOString();
        
        // Create a new task object with the updates
        const updatedTask: Task = {
            ...task,
            title: updates.title !== undefined ? updates.title : task.title,
            description: updates.description !== undefined ? updates.description : task.description,
            status: updates.status !== undefined ? updates.status : task.status,
            updatedAt: now
        };
        
        return updatedTask;
    }

    async updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
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
        const updateExpressions: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

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

        const response = await this.client.send(new UpdateCommand({
            TableName: this.tableName,
            Key: { taskId },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'UPDATED_NEW',
        }));

        return response.Attributes as Task;
    }

    async deleteTask(taskId: string): Promise<boolean> {
        // Ensure table exists before operations
        await this.ensureTableExists();
        
        await this.client.send(new DeleteCommand({
            TableName: this.tableName,
            Key: { taskId },
        }));

        return true;
    }

    async listTasks(): Promise<Task[]> {
        // Ensure table exists before operations
        await this.ensureTableExists();
        
        const response = await this.client.send(new ScanCommand({
            TableName: this.tableName,
        }));

        return response.Items as Task[] || [];
    }
}

export const dynamoDBService = new DynamoDBService();