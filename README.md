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

## Running Locally
* `sam build`
* `sam local start-api`
* API available at http://localhost:3000 and can be hit with tools like Postman

## Deploy 
* `sam build`
* `sam deploy --guided`

