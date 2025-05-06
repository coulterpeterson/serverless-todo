# serverless-todo

A serverless REST API for managing tasks, built with AWS SAM, TypeScript, AWS Lambda, and Amazon API Gateway.

## REST API Endpoints

#### `GET /tasks`

Returns all tasks.

##### Response

```json
[
  {
    "taskId": "e4c59e7b-9d3e-4b2e-a3f0-7b25b7b0b589",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "createdAt": "2025-05-06T15:30:00.000Z",
    "updatedAt": "2025-05-06T15:30:00.000Z"
  }
]
```

#### `POST /tasks`

Creates a new task.

##### Request Body

```json
{
  "title": "Read book",
  "description": "Finish reading 'Clean Code'",
  "status": "pending"
}
```

##### Response

Returns the created task (with `taskId`, `createdAt`, and `updatedAt`).

---

#### `PUT /tasks/:taskId`

Updates a task by ID.

##### Request Body

Any combination of:

```json
{
  "title": "Read book (updated)",
  "description": "Finish reading 'Clean Code' and start 'Refactoring'",
  "status": "in-progress"
}
```

##### Response

Returns the updated task object.

#### `DELETE /tasks/:taskId`

Deletes a task by ID.

##### Response

```json
{ "message": "Task deleted" }
```

### Task Object Schema

| Field         | Type                                        | Notes                        |
| ------------- | ------------------------------------------- | ---------------------------- |
| `taskId`      | `string`                                    | UUID, required               |
| `title`       | `string`                                    | Required, non-empty          |
| `description` | `string`                                    | Optional                     |
| `status`      | `'pending' \| 'in-progress' \| 'completed'` | Required enum                |
| `createdAt`   | `string`                                    | ISO 8601 timestamp, required |
| `updatedAt`   | `string`                                    | ISO 8601 timestamp, required |

### Status Enum Values

* `pending`
* `in-progress`
* `completed`

## Prerequisites
* AWS SAM CLI
* Node.js 18+
* TypeScript
* Docker (for local DynamoDB)

## Project Structure
This project uses a TypeScript codebase that is compiled to JavaScript before deployment:

* Source TypeScript files in the `src/` directory
* Compiled JavaScript outputs to the `dist/` directory
* The build process copies `package.json` to `dist/` and installs dependencies there
* All dependencies are included directly in the dist folder for Lambda deployment

## Local Development

### Setting up Local DynamoDB
The application is configured to use a local DynamoDB instance when running with SAM CLI locally.

1. Start a local DynamoDB container:
```bash
docker run -p 8000:8000 amazon/dynamodb-local
```

2. The application will automatically create the required table when run locally.

### Running the API
Using npm scripts:
```bash
npm run dev
```

Or manually:
```bash
# Clean dist directory
npm run clean

# Compile TypeScript and install dependencies
npm run build

# Build with SAM
sam build

# Start local API
sam local start-api
```

The API will be available at http://localhost:3000 and can be tested with tools like Postman.

## Deploy 
Using npm scripts:
```bash
npm run deploy
```

Or manually:
```bash
# Compile TypeScript and install dependencies
npm run build

# Build with SAM
sam build

# Deploy to AWS (interactive)
sam deploy --guided
```

