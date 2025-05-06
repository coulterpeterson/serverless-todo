import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
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
    private readonly tableName: string;

    constructor() {
        const ddbClient = new DynamoDBClient();
        this.client = DynamoDBDocumentClient.from(ddbClient);
        this.tableName = process.env.TASKS_TABLE || 'Tasks';
    }

    async createTask(taskInput: TaskInput): Promise<Task> {
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
        const response = await this.client.send(new GetCommand({
            TableName: this.tableName,
            Key: { taskId },
        }));

        return response.Item as Task | null;
    }

    async updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
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
        await this.client.send(new DeleteCommand({
            TableName: this.tableName,
            Key: { taskId },
        }));

        return true;
    }

    async listTasks(): Promise<Task[]> {
        const response = await this.client.send(new ScanCommand({
            TableName: this.tableName,
        }));

        return response.Items as Task[];
    }
}

export const dynamoDBService = new DynamoDBService();