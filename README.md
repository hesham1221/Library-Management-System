# Library Management System

## Overview

This Library Management System is a robust platform designed to manage library operations effectively. It features two distinct roles: borrower and admin, catering to different user needs.

## Features

- **Borrower Features:**
  - Register, login, forget password, reset password, and verify account.
  - Book and return books.
  - View all available books.
  - Email notifications for borrowing and due dates.

- **Admin Features:**
  - Create and manage borrower and admin accounts.
  - Manage books and authors.
  - View booking history of each book borrowing for each day (with cursor).
  - Perform advanced administrative tasks.

## Technical Stack

- **Languages and Frameworks:** TypeScript, Express.js.
- **Database:** PostgreSQL with TypeORM.
- **Caching and Queues:** Redis.
- **Containerization:** Docker and Docker Compose.
- **Rate Limiting:** rate-limiter-flexible (5 requests/second).
- **Email Templates:** MJML.

## Project File Tree Structure

Our Library Management System follows a modular and clean architecture for ease of navigation and scalability. Below is the project's directory structure:

- `src/`: Source directory containing all the working files.
  - `common/`: Shared utilities, types, and interfaces.
    - `config/`: Application configuration files and environment variable management.
    - `database/`: Database connection and management scripts.
    - `errors/`: Custom error definitions and handling.
    - `middlewares/`: Express middlewares for request processing.
    - `providers/`: External service providers and integrations.
    - `types/`: TypeScript type definitions and enums.
    - `utils/`: Utility functions and helpers.
  - `modules/`: Feature-based modules.
    - `auth/`: Authentication module including controllers and services for user authentication.
    - `books/`: Books module handling book management with DTOs, entities, repositories, and routes.
    - `users/`: Users module to manage user information and actions.
    - `uploads/`: File upload and management functionalities.
  - `app.ts`: Main application file initializing the server and middleware.
- `uploads/`: Directory for storing uploaded files.

## Internationalization

- Error messages and communications are available in English (EN) and Arabic (AR), determined by header or parameter settings by adding `lang` parameter or header (if both parameter would take effect).

## API Design

- **Response Structure:**  

  ```typescript
  export class ResponseType<T> {
    message: string;
    data: T;
    code: number;
  }
  ```

- **Error Handling:** Custom `BaseError` class, extending `Error` with localization support.
- **File Uploads:** Utilizes `multer` for handling file uploads.
- **Rate Limiting:** Configured for global application use.

## Repository Pattern

- Custom `BaseRepository` class, extended for each specific repository, ensuring consistency and reusability.

## Pagination and Data Handling

- Default pagination with options for page and limit.
- Cursor pagination for specific use cases.
- The pagination information is nested within the data property of the response.
- **Pagination Response Structure:**

```typescript
export interface PaginationRes<T> {
  items: T[];
  pageInfo: {
    page: number;
    limit: number;
    nextCursor: string;
    beforeCursor: string;
    totalCount: number;
    hasNext: boolean;
    hasBefore: boolean;
    direction: CursorBasedPaginationDirection;
  };
}
  ```

- `items`: Array of data items.
- `pageInfo`: Contains pagination details such as page numbers, limits, cursors, total count, and navigation flags.
- Supports both traditional and cursor-based pagination, with `CursorBasedPaginationDirection` indicating the direction of navigation.

```typescript
enum CursorBasedPaginationDirection {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}
```

## API Documentaion

- Import `Liberary-Management-System.collection.json` to Postman and add you environment to test the API.

## Additional Features

- **File Management:** Cron job for daily maintenance of unused files.
- **Asynchronous Error Handling:** Integrated with `express-async-errors`.

## Running the Application

### Using Docker

- **Development:** Use `docker-compose` for a seamless development environment.
- **Production:** Use `docker-compose.prod` for production deployment.

### Without Docker

- **Prerequisites:** Ensure Node version 18 is installed.
- **Installation:** Run `npm install`.
- **Environment Setup:** Rename `.env.example` to `.env` and update it with your own keys.
- **Database Migration:** Run migrations with `npm run typeorm:migration:run` for both development and production setups.
- **Development Mode:** Start the application in development mode with `npm run dev`.
- **Production Mode:** Build the application using `npm run build`, then start it with `npm start`.

### Accessing the Application

- The application will be accessible on the port specified in your `.env` file.
