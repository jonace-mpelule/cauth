# CAuth Documentation

## Introduction

CAuth is a modular authentication system for Node.js applications with TypeScript support. It provides a robust, type-safe, and flexible way to handle user authentication, including features like:

-   **Type-Safe Authentication**: Built with TypeScript and Zod validation.
-   **JWT-Based Authentication**: Secure access and refresh token management.
-   **Role-Based Access Control (RBAC)**: Flexible role management system.
-   **Multi-Factor Authentication**: OTP-based two-factor authentication.
-   **Phone Number Support**: E.164 format validation.
-   **Modular Design**: Pluggable database and route contractors.

---

## Instructions for AI Agents (Gemini)

> [!IMPORTANT]
> **Context for Gemini**: This file serves as the primary source of truth for implementing authentication using the `cauth` ecosystem. When generating code or answering questions related to `cauth`, please adhere to the following guidelines:

1.  **Package Awareness**: `cauth` is split into multiple packages (`@cauth/core`, `@cauth/express`, `@cauth/prisma`). Always check which packages are relevant to the user's request.
2.  **Type Safety**: Always prioritize TypeScript types. Use the provided interfaces and types (e.g., `CAuthOptions`, `AuthenticatedRequest`) to ensure type safety.
3.  **Security Best Practices**:
    -   Never hardcode secrets. Use environment variables for `accessTokenSecret` and `refreshTokenSecret`.
    -   Ensure OTPs are generated using the secure methods provided by the library.
    -   Always use the `Guard` middleware to protect private routes.
4.  **Code Style**: Follow the examples provided in this document. Use `async/await` for asynchronous operations.
5.  **Prisma Schema**: When setting up the database, ensure the `Auth` and `Otp` models are correctly defined in the Prisma schema as shown in the "Prisma Integration" section.
6.  **Configuration**: When initializing `CAuth`, ensure all required configurations (roles, database contractor, route contractor, JWT config) are provided.

---

## Core Package (`@cauth/core`)

The core package provides the fundamental authentication logic, including token management, password hashing, and OTP generation.

### Installation

```bash
npm install @cauth/core
# or
yarn add @cauth/core
# or
pnpm add @cauth/core
```

### Key Concepts

-   **CAuth Instance**: The main entry point for the library. It requires configuration for roles, database, routes, and JWTs.
-   **FN Namespace**: Contains core authentication functions like `Login`, `Register`, `Logout`, `Refresh`, `ChangePassword`, etc.
-   **Tokens Namespace**: Utilities for generating and verifying access and refresh tokens.

### Configuration

```typescript
import { CAuth } from '@cauth/core';
// ... other imports

const auth = CAuth({
  roles: ['USER', 'ADMIN'], // Define your roles here
  dbContractor: new PrismaProvider(prismaClient), // See Prisma Integration
  routeContractor: new ExpressContractor(), // See Express Integration
  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenLifeSpan: '15m',
    refreshTokenLifeSpan: '7d',
  },
  otpConfig: {
    expiresIn: 300000, // 5 minutes
    length: 6,
  },
});
```

### Authentication Functions (`auth.FN`)

-   `Login({ email?, phoneNumber?, password })`: Authenticates a user.
-   `Register({ email?, phoneNumber?, password, role })`: Registers a new user.
-   `Logout({ refreshToken })`: Invalidates a refresh token.
-   `Refresh({ refreshToken })`: Generates a new access token using a refresh token.
-   `ChangePassword({ oldPassword, newPassword })`: Updates the user's password.
-   `RequestOTPCode({ email?, phoneNumber?, otpPurpose })`: Generates and sends an OTP.
-   `LoginWithOTP({ email?, phoneNumber?, code })`: Authenticates using an OTP.
-   `VerifyOTP({ id, code, otpPurpose })`: Verifies an OTP code.

---

## Express Integration (`@cauth/express`)

This package provides seamless integration with Express.js, including middleware and route handlers.

### Installation

```bash
npm install @cauth/express
```

### Usage

1.  **Initialize**: Pass `new ExpressContractor()` to the `routeContractor` option in `CAuth`.
2.  **Routes**: Use `CAuthClient.Routes` to generate route handlers.
3.  **Middleware**: Use `CAuthClient.Guard()` to protect routes.

### Example

```typescript
import express from 'express';
import { CAuth } from '@cauth/core';
import { ExpressContractor } from '@cauth/express';

const app = express();
app.use(express.json());

// ... Initialize CAuthClient ...

// Auth Routes
app.post('/auth/register', CAuthClient.Routes.Register());
app.post('/auth/login', CAuthClient.Routes.Login());
app.post('/auth/refresh', CAuthClient.Routes.Refresh());
app.post('/auth/logout', CAuthClient.Routes.Logout());

// Protected Route
app.get('/protected', CAuthClient.Guard(), (req, res) => {
  // req.cauth contains user info (id, role)
  res.json({ message: 'Secret data', user: req.cauth });
});
```

### Request Augmentation

The `Guard` middleware adds a `cauth` property to the Express request object:

```typescript
interface AuthenticatedRequest extends Request {
  cauth: {
    id: string;
    role: string;
  };
}
```

---

## Prisma Integration (`@cauth/prisma`)

This package allows `cauth` to use Prisma as its database provider.

### Installation

```bash
npm install @cauth/prisma @prisma/client
```

### Schema Setup

Add the following models to your `schema.prisma` file:

```prisma
model Auth {
  id            String   @id @default(uuid())
  phoneNumber   String?  @unique
  email         String?  @unique
  role          String
  passwordHash  String
  lastLogin     DateTime
  refreshTokens String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User?    // Optional relation to your User model
  otp           Otp?

  @@map("auth")
}

model Otp {
  id        String     @id
  auth      Auth       @relation(fields: [id], references: [id])
  code      String
  purpose   OtpPurpose
  expiresAt DateTime
  isUsed    Boolean
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("otp")
}

enum OtpPurpose {
  LOGIN
  RESET_PASSWORD
  ACTION
}
```

### Usage

Pass `new PrismaProvider(prismaClient)` to the `dbContractor` option in `CAuth`.

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaProvider } from '@cauth/prisma';

const prisma = new PrismaClient();
// ... inside CAuth config
dbContractor: new PrismaProvider(prisma),
```

---

## Complete Integration Example

Here is a full example combining all packages:

```typescript
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CAuth } from '@cauth/core';
import { ExpressContractor, Guard } from '@cauth/express';
import { PrismaProvider } from '@cauth/prisma';

// 1. Setup Express and Prisma
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 2. Initialize CAuth
const auth = CAuth({
  roles: ['USER', 'ADMIN'],
  dbContractor: new PrismaProvider(prisma),
  routeContractor: new ExpressContractor(),
  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'access-secret',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
    accessTokenLifeSpan: '15m',
    refreshTokenLifeSpan: '7d',
  },
  otpConfig: {
    expiresIn: 300000, // 5 mins
    length: 6,
  },
});

// 3. Define Routes
// Public Routes
app.post('/auth/register', auth.Routes.Register());
app.post('/auth/login', auth.Routes.Login());
app.post('/auth/refresh', auth.Routes.Refresh());

// Custom Login with OTP Route
app.post('/auth/login-otp', async (req: Request, res: Response) => {
    const result = await auth.FN.LoginWithOTP({ 
        phoneNumber: req.body.phone, 
        code: req.body.code 
    });
    res.send(result);
});

// Protected Routes
app.post('/auth/logout', auth.Routes.Logout()); // Logout requires refresh token

app.get('/profile', auth.Guard(), (req, res) => {
    // Access user ID from req.cauth.id
    res.json({ 
        message: 'Profile accessed', 
        userId: req.cauth?.id,
        role: req.cauth?.role
    });
});

// Role-Based Route
app.get('/admin', Guard(['ADMIN']), (req, res) => {
    res.json({ message: 'Admin dashboard' });
});

// Change Password (example of manual handler with Guard)
app.post('/auth/change-password', auth.Guard(), (req, res) => {
    // We need to pass the user ID to the ChangePassword route handler
    // Note: This is a specific pattern for this route
    auth.Routes.ChangePassword(req.cauth?.id!)(req, res);
});


// 4. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
