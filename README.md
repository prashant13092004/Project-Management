# Secure Auth API

A secure authentication backend built with **Node.js**, **Express.js**, and **MongoDB**, laying the foundation for a full project-management system. The auth layer — registration, login, JWT sessions, email verification — is complete; role-based project and task management is the next phase of development.

---

## Features

### ✅ Implemented

- User Registration & Login
- JWT Authentication (Access + Refresh Tokens via httpOnly cookies)
- Protected Routes via custom `verifyJWT` middleware
- Secure Password Hashing (bcrypt)
- Email Verification (crypto-hashed, time-expiring tokens sent via Nodemailer + Mailgen)
- Centralized Error Handling (`ApiError` / `ApiResponse` standardized responses)
- Async Error Handling Wrapper (`asyncHandler`)
- Request Validation Middleware (`express-validator`)
- Healthcheck Endpoint
- Modular MVC-style Architecture (routes / controllers / models / middlewares / utils)

### 🚧 Planned / In Progress

- Project CRUD APIs
- Task CRUD APIs
- Role-based Access Control (`admin`, `project_admin`, `member` roles already defined as constants)
- Task Status Workflow (`todo`, `in_progress`, `done` already defined as constants)
- Forgot Password flow (email template exists, route not yet wired)
- Resend Email Verification (stubbed, not yet implemented)

---

## Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Auth & Security
- JSON Web Tokens (jsonwebtoken)
- bcrypt
- express-validator

### Email
- Nodemailer
- Mailgen

### Tools
- Postman
- Git & GitHub
- VS Code

---

## Installation & Setup

### Clone the Repository
```
git clone https://github.com/prashant13092004/Project-Management.git
```

### Navigate to the Project Directory
```
cd Project-Management
```

### Install Dependencies
```
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=your_access_token_expiry
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
CORS_ORIGIN=http://localhost:5173
MAILTRAP_SMTP_HOST=your_mailtrap_host
MAILTRAP_SMTP_PORT=your_mailtrap_port
MAILTRAP_SMTP_USER=your_mailtrap_user
MAILTRAP_SMTP_PASS=your_mailtrap_pass
```

---

## Run the Project

```
npm run dev
```

---

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/healthcheck` | Check if the server is running |

### Auth
| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Log in and receive access/refresh tokens | No |
| GET | `/api/v1/auth/verify-email/:verificationToken` | Verify user email | No |
| POST | `/api/v1/auth/logout` | Log out and clear tokens | Yes |
| GET | `/api/v1/auth/current-user` | Get the currently logged-in user | Yes |

---

## Learning Outcomes

Through this project, I gained practical experience with:

- Backend Development with Node.js & Express.js
- Authentication & Authorization (JWT, bcrypt)
- Secure Token Handling (httpOnly cookies, hashed temporary tokens)
- Transactional Email Workflows (Nodemailer, Mailgen)
- MongoDB & Mongoose schema design
- Centralized Error Handling & Response Standardization
- Request Validation Patterns
- Modular, Scalable Backend Architecture

---

## Author

**Prashant Sharma**
GitHub: [prashant13092004](https://github.com/prashant13092004)
