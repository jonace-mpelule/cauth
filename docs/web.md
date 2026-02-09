# CAuth Documentation: The Source of Truth

CAuth is a modular, type-safe, and developer-first authentication ecosystem for Node.js, built from the ground up with TypeScript and Zod. It decouples core authentication logic from database implementations and web frameworks using a "Contractor" pattern.

---

## 🤖 Instructions for AI Agents (Gemini)

> [!IMPORTANT]
> **Context for Gemini/AI**: This file is the primary reference for implementing `cauth`. Follow these rules strictly:
> 1.  **Architecture**: `cauth` uses **Contractors**. Always initialize with a `dbContractor` (e.g., `@cauth/prisma`) and a `routeContractor` (e.g., `@cauth/express`).
> 2.  **FN vs Routes**:
>     -   Use `auth.FN` for programmatic logic (e.g., inside custom services).
>     -   Use `auth.Routes` for pre-built HTTP handlers.
> 3.  **Type Safety**: Never use `any`. Always leverage the inferred types from the `CAuth` instance, specifically the `roles` provided during initialization.
> 4.  **OTP Handling**: OTP codes are *returned* by the `onCode` callback in `RequestOTPCode`. Ensure the implementing code handles the delivery (Email/SMS).
> 5.  **Security**: Remind users that `accessTokenSecret` and `refreshTokenSecret` MUST be high-entropy strings from environment variables.

---

## 📦 Project Structure

CAuth is distributed as a monorepo containing:
-   **`@cauth/core`**: The engine. Logic for tokens, hashing, and flow.
-   **`@cauth/prisma`**: The database adapter (DatabaseContract).
-   **`@cauth/express`**: The web framework adapter (RoutesContract).

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install @cauth/core @cauth/prisma @cauth/express @prisma/client
```

### 2. Database Schema (Prisma)

Add these core models to your `schema.prisma`. These are optimized for security (hashed OTPs, hashed refresh token storage).

```prisma
model Auth {
  id            String   @id @default(cuid())
  phoneNumber   String?  @unique
  email         String?  @unique
  role          String
  passwordHash  String
  lastLogin     DateTime @default(now())
  refreshTokens Json[]   // Stores hashed rotation metadata
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User?    // Link to your application user
  otp           Otp?

  @@map("auth")
}

model Otp {
  id        String     @id // Same as Auth.id
  auth      Auth       @relation(fields: [id], references: [id])
  code      String     // Argon2id hash of the code
  purpose   OtpPurpose
  expiresAt DateTime
  isUsed    Boolean    @default(false)
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

### 3. Initialization

Create an `auth.ts` file to export your configured instance.

```typescript
import { CAuth } from '@cauth/core';
import { PrismaContractor } from '@cauth/prisma';
import { ExpressContractor } from '@cauth/express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const auth = CAuth({
  roles: ['USER', 'ADMIN', 'DEVELOPER'] as const, // Strongly typed roles
  dbContractor: new PrismaContractor(prisma),
  routeContractor: new ExpressContractor(),
  
  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenLifeSpan: '15m',   // Supports 'ms' format: '2h', '7d', etc.
    refreshTokenLifeSpan: '30d',
  },
  
  otpConfig: {
    expiresIn: 300000, // 5 minutes (in ms)
    length: 6,         // 4 to 8 digits
  },
});

export default auth;
```

---

## 🛠️ Functional API (`auth.FN`)

The `FN` namespace provides the raw business logic. Every function returns a `Result` object: `{ success: true, value: T }` or `{ success: false, errors: FNError[] }`.

### Registration Variations

```typescript
// Register with Email
await auth.FN.Register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  role: 'USER'
});

// Register with Phone (E.164 format)
await auth.FN.Register({
  phoneNumber: '+27123456789',
  password: 'SecurePassword123!',
  role: 'ADMIN'
});
```

### Login Variations

```typescript
// Standard Password Login (Email)
await auth.FN.Login({
  email: 'user@example.com',
  password: 'SecurePassword123!'
});

// Standard Password Login (Phone)
await auth.FN.Login({
  phoneNumber: '+27123456789',
  password: 'SecurePassword123!'
});
```

### OTP Lifecycle (Passwordless)

1. **Request Code**:
```typescript
await auth.FN.RequestOTPCode({
  email: 'user@example.com', // or phoneNumber
  otpPurpose: 'LOGIN',       // or 'RESET_PASSWORD' | 'ACTION'
  usePassword: false,        // If true, requires 'password' field for extra security
  onCode: (code) => {
    // Deliver this code via your Email/SMS provider
    console.log(`Generated OTP: ${code}`);
  }
});
```

2. **Login with Code**:
```typescript
await auth.FN.LoginWithOTP({
  email: 'user@example.com',
  code: '123456'
});
```

3. **Verify Code (Manual)**:
```typescript
await auth.FN.VerifyOTP({
  id: 'user_uuid',
  code: '123456',
  otpPurpose: 'ACTION'
});
```

### Session Management

```typescript
// Refresh Access Token
await auth.FN.Refresh({ refreshToken: '...' });

// Logout (Revokes specific refresh token)
await auth.FN.Logout({ refreshToken: '...' });

// Change Password
await auth.FN.ChangePassword({
  accountId: '...',
  oldPassword: '...',
  newPassword: '...'
});
```

---

## 🌐 Web Integration (Express)

### Pre-built Routes

Quickly mount standard authentication endpoints.

```typescript
app.post('/auth/register', auth.Routes.Register());
app.post('/auth/login',    auth.Routes.Login());
app.post('/auth/refresh',  auth.Routes.Refresh());
app.post('/auth/logout',   auth.Routes.Logout());

// Custom Change Password handler (needs userId injected via logic or URL)
app.post('/auth/pw-reset', (req, res) => auth.Routes.ChangePassword(req.user.id)(req, res));
```

### Guard & RBAC

Protect routes using the `Guard` middleware.

```typescript
// Anyone with a valid token
app.get('/profile', auth.Guard(), (req, res) => {
  const { id, role } = req.cauth; // Injected session data
  res.json({ id, role });
});

// Restricted to specific roles
app.get('/admin/stats', auth.Guard(['ADMIN', 'DEVELOPER']), (req, res) => {
  res.send('Sensitive data');
});
```

---

## 🔑 Token Management (`auth.Tokens`)

If you need to manually handle tokens:

- `auth.Tokens.GenerateAccessToken(payload)`
- `auth.Tokens.GenerateRefreshToken(payload)`
- `auth.Tokens.GenerateTokenPairs(payload)`
- `auth.Tokens.VerifyAccessToken(token)`
- `auth.Tokens.VerifyRefreshToken(token)`

---

## 🛡️ Security Implementation Details

### Hashing
- **Passwords**: Hashed using **Argon2id** (m=65536, t=3, p=4).
- **OTPs**: Stored as **Argon2id** hashes. The numeric code is never stored in plaintext.
- **Refresh Tokens**: Stored as **HMAC-SHA256** signatures. If the database leaks, the tokens found cannot be used to authenticate.

### Rotation & Expiry
CAuth supports **Refresh Token Rotation**. When a refresh token is used, it is revoked and a new one can be issued (depending on contractor implementation).

---

## ❌ Error Mapping

The Express contractor automatically maps core errors to HTTP codes:

| Error | HTTP Status | Description |
| :--- | :--- | :--- |
| `CredentialMismatchError` | 401 | Invalid password or user not found. |
| `InvalidDataError` | 400 | Zod validation failed for input. |
| `DuplicateAccountError` | 409 | Email or Phone already exists. |
| `InvalidOTPCode` | 422 | Wrong code or expired. |
| `InvalidRoleError` | 403 | User lacks the required role for the Guard. |
| `AccountNotFoundError` | 404 | The requested account ID does not exist. |

---

## 🌐 Express Deep-Dive

### Manual Usage vs Pre-built Routes

While `auth.Routes` handles the HTTP layer for you, you can use `auth.FN` directly for more control.

```typescript
// Using auth.Routes (Automatic)
app.post('/auth/login', auth.Routes.Login());

// Manual Integration (Full Control)
app.post('/auth/login', async (req, res) => {
  const result = await auth.FN.Login({
    email: req.body.email,
    password: req.body.password
  });

  if (!result.success) {
    // result.errors contains FNError objects
    return res.status(401).json({ errors: result.errors });
  }

  // result.value contains { accessToken, refreshToken, user }
  res.cookie('token', result.value.accessToken, { httpOnly: true });
  res.json(result.value);
});
```

### Accessing Session Data

The `Guard` middleware injects typed session data into `req.cauth`.

```typescript
// Setup global middleware for all routes below
app.use('/api/v1', auth.Guard());

app.get('/api/v1/user/settings', (req, res) => {
  const userId = req.cauth.id;
  const userRole = req.cauth.role;
  // ... fetch settings for this user
});
```

---

## ⚠️ Advanced Error Handling

CAuth provides helpers to identify specific error types programmatically.

```typescript
import { isCAuthError } from '@cauth/core';

const result = await auth.FN.Login({...});

if (!result.success) {
  for (const err of result.errors) {
    if (isCAuthError(err, 'CredentialMismatchError')) {
      console.error('User provided the wrong password');
    }
    
    if (isCAuthError(err, 'InvalidDataError')) {
      console.error('Validation failed:', err.message);
    }
  }
}
```

### Common Error Names
Use these strings with `isCAuthError(err, 'NAME')`:
- `CredentialMismatchError`
- `InvalidDataError`
- `AccountNotFoundError`
- `InvalidRoleError`
- `DuplicateAccountError`
- `InvalidOTPCode`

---

## 🏗️ Custom Database Providers

You can build your own `DatabaseContract` to support any persistence layer (MongoDB, Drizzle, etc.).

```typescript
import { DatabaseContract, AuthModel, CAuthOptions, OtpPurpose } from '@cauth/core';

class MyCustomDB implements DatabaseContract {
  async findAccountById({ id }) {
    // Fetch from your DB
    return { id, email: '...', passwordHash: '...', role: 'USER' };
  }

  async findAccountWithCredential({ email, phoneNumber }) {
    // Find user by either email or phone
  }

  async createOTP({ config }, { id, purpose }) {
    // 1. Generate numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 2. Hash it (Optional but recommended)
    // 3. Save to DB with expiresAt
    return { code, purpose, expiresAt: new Date(Date.now() + 300000) };
  }

  // ... implement other required methods
}

const auth = CAuth({
  dbContractor: new MyCustomDB(),
  // ... rest of config
});
```

---

## 🏛️ Type System Reference

CAuth is built with deep type inference. Here are the key types you might interact with:

### `AuthModel`
The base structure of an account object returned from the DB.
```typescript
interface AuthModel {
  id: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  passwordHash?: string;
}
```

### `Result<T>`
The standard wrapper for all `FN` calls.
```typescript
type Result<T> = 
  | { success: true; value: T; errors: null }
  | { success: false; value: null; errors: FNError[] };
```

---

## 🛡️ API Security & Use Cases

### Password Reset Flow (OTP)

1. **Step 1: Request Code**
   The user enters their email. We generate a code and "send" it.
   ```typescript
   await auth.FN.RequestOTPCode({
     email: 'user@example.com',
     otpPurpose: 'RESET_PASSWORD',
     onCode: (code) => sendEmail(email, `Your reset code is ${code}`)
   });
   ```

2. **Step 2: Verify Code**
   The user enters the code to "unlock" the password update.
   ```typescript
   const verification = await auth.FN.VerifyOTP({
     id: accountId,
     code: '123456',
     otpPurpose: 'RESET_PASSWORD'
   });
   ```

3. **Step 3: Update Password**
   If `verification.success`, use `auth.FN.ChangePassword`.

### Multi-Tenant Auth
You can instantiate multiple `CAuth` clients for different parts of your application:
```typescript
const customerAuth = CAuth({ roles: ['USER'] as const, ... });
const employeeAuth = CAuth({ roles: ['ADMIN', 'EDITOR'] as const, ... });
```

### Magic Links (OTP)
Instead of a password, use `RequestOTPCode` with `otpPurpose: 'LOGIN'`. When the user enters the code, call `LoginWithOTP` which returns the session tokens.
