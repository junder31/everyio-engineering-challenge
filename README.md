# Every.io Task Management API

A robust, scalable task management API built with Node.js, TypeScript, Apollo Server GraphQL, and comprehensive testing.

## Features

- **GraphQL API** with Apollo Server
- **Authentication & Authorization** using JWT tokens
- **Task Management** with four states: TODO, IN_PROGRESS, DONE, ARCHIVED
- **User-specific Tasks** - users can only view/modify their own tasks
- **Dependency Injection** with tsyringe for better testability and maintainability
- **Comprehensive Testing** with Jest
- **Logging** with Winston
- **Docker Support** for easy deployment
- **TypeScript** for type safety and better developer experience

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **API**: GraphQL with Apollo Server
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: PostgreSQL with Sequelize ORM
- **Dependency Injection**: tsyringe with decorators
- **Testing**: Jest with ts-jest
- **Logging**: Winston
- **Containerization**: Docker

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- PostgreSQL 12+ (or Docker for containerized setup)
- Docker (optional)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd everyio-engineering-challenge
npm install
```

2. **Set up database:**
```bash
# Option 1: Use Docker Compose (includes PostgreSQL)
docker-compose up -d postgres

# Option 2: Use local PostgreSQL
# Create database: task_api
# Update environment variables as needed
```

3. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=4000
JWT_SECRET=your-secret-key-here
LOG_LEVEL=info
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_api
DB_USER=task_api_user
DB_PASSWORD=task_api_password
```

**Note**: The application uses a dedicated database user `task_api_user` with limited privileges instead of the root `postgres` user for better security. When using Docker Compose, this user is automatically created during initialization.

4. **Run database migrations:**
```bash
npm run db:migrate
```

5. **Start development server:**
```bash
npm run dev
```

6. **Run test database migrations:**
```bash
npm run db:migrate:test
```

7. **Run tests:**
```bash
npm test
```

8. **Build for production:**
```bash
npm run build
npm start
```

### Docker Deployment

**Option 1: Full stack with PostgreSQL**
```bash
docker-compose up -d
```

**Option 2: App only (external database)**
```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

## API Usage

The GraphQL playground is available at `http://localhost:4000/graphql`

### Postman Collection

A complete Postman collection is included in the project (`Task-Management-API.postman_collection.json`) with examples for all API endpoints. Import this collection into Postman to quickly test the API:

1. Open Postman
2. Click "Import" and select the collection file
3. The collection includes:
   - Authentication flows (Register/Login)
   - All task operations (CRUD)
   - Error scenarios
   - Automatic token management

The collection uses variables for the base URL and authentication token, making it easy to switch between environments.

### Authentication

**Register a new user:**
```graphql
mutation Register {
  register(input: {
    username: "johndoe"
    email: "john@example.com"
    password: "securepassword"
  }) {
    token
    user {
      id
      username
      email
    }
  }
}
```

**Login:**
```graphql
mutation Login {
  login(input: {
    email: "john@example.com"
    password: "securepassword"
  }) {
    token
    user {
      id
      username
      email
    }
  }
}
```

**Include the token in headers:**
```
{
  "Authorization": "Bearer your-jwt-token-here"
}
```

### Task Operations

**Get all your tasks:**
```graphql
query GetTasks {
  tasks {
    id
    title
    description
    status
    createdAt
    updatedAt
  }
}
```

**Create a task:**
```graphql
mutation CreateTask {
  createTask(input: {
    title: "Complete project"
    description: "Finish the Every.io coding challenge"
    status: TODO
  }) {
    id
    title
    description
    status
  }
}
```

**Update a task:**
```graphql
mutation UpdateTask {
  updateTask(input: {
    id: "1"
    title: "Updated title"
    description: "Updated description"
  }) {
    id
    title
    description
    updatedAt
  }
}
```

**Update task status:**
```graphql
mutation UpdateTaskStatus {
  updateTaskStatus(input: {
    id: "1"
    status: IN_PROGRESS
  }) {
    id
    status
    updatedAt
  }
}
```

**Archive a task:**
```graphql
mutation ArchiveTask {
  archiveTask(id: "1") {
    id
    status
  }
}
```


## Task States

- **TODO** - Initial state for new tasks
- **IN_PROGRESS** - Tasks currently being worked on
- **DONE** - Completed tasks
- **ARCHIVED** - Tasks that have been archived

## Architecture Decisions

### Domain-Driven Design

The application follows Domain-Driven Design (DDD) principles with clear domain boundaries:

1. **Task Domain**: Handles all task-related functionality (CRUD operations, status management, archiving)
2. **User Domain**: Manages user authentication, registration, and user data
3. **Domain Separation**: Each domain contains its own models, services, stores, types, and GraphQL components

### Scalability Considerations

1. **Domain-Driven Design**: Clear separation of business domains for better maintainability and scaling
2. **Type Safety**: Full TypeScript implementation prevents runtime errors
3. **Stateless Authentication**: JWT tokens allow horizontal scaling
4. **Layered Architecture**: Separation of data access, business logic, and presentation layers
5. **Comprehensive Logging**: Structured logging for monitoring and debugging

### Security

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Authorization**: Users can only access their own tasks
- **Input Validation**: GraphQL schema validation
- **Error Handling**: Structured error responses without sensitive data leakage

### Code Quality

This project uses ESLint and Prettier for consistent code style and quality:

```bash
# Lint the code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is formatted correctly
npm run format:check

# Type checking
npm run typecheck
```

### Pre-commit Hooks

The project uses Husky and lint-staged to run quality checks before commits:
- Type checking with TypeScript
- ESLint for code quality
- Prettier for code formatting
- Running tests

To set up pre-commit hooks after cloning:
```bash
npm run prepare
```

## Code Quality

- **TypeScript**: Strong typing throughout
- **ESLint Configuration**: Consistent code style
- **Comprehensive Tests**: Unit tests for all major functionality
- **Logging**: Structured logging with different levels
- **Docker**: Consistent deployment environment

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

Test coverage includes:
- Authentication utilities
- Data store operations
- GraphQL resolvers
- Authorization logic

## Environment Variables

```bash
NODE_ENV=development
PORT=4000
JWT_SECRET=your-secret-key-here
LOG_LEVEL=info

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_api
DB_USER=task_api_user
DB_PASSWORD=task_api_password
```

## Health Check

Health check endpoint available at: `http://localhost:4000/health`