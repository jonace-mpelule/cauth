# @cauth/core

[![NPM Version](https://img.shields.io/npm/v/@cauth/core.svg)](https://www.npmjs.com/package/@cauth/core)
[![License](https://img.shields.io/npm/l/@cauth/core.svg)](https://github.com/jonace-mpelule/cauth/blob/main/LICENSE)

**CAuth Core** is a robust, type-safe authentication library for Node.js, built with TypeScript and Zod. It provides a modular foundation for building secure authentication systems with pluggable database and route handlers.

> [!IMPORTANT]
> For more information and full documentation, visit **[cauth.dev](https://cauth.dev)**.

---

## ✨ Features

- **🛡️ Type-Safe**: Comprehensive TypeScript support with Zod schema validation.
- **🔑 JWT-Based**: Industry-standard access and refresh token management.
- **🎭 Role-Based Access Control (RBAC)**: Flexible, type-safe role management.
- **📱 Multi-Factor Authentication**: Secure OTP generation for 2FA, password resets, and more.
- **📞 Phone & Email Support**: E.164 phone validation and email support out of the box.
- **🔒 Secure by Design**:
  - **Argon2id**: State-of-the-art password hashing.
  - **Hashed Refresh Tokens**: Protection against database leaks.
  - **CSPRNG OTPs**: Cryptographically secure numeric codes.
- **🧩 Modular Architecture**: Decoupled core logic from database (Prisma) and framework (Express).

---

## 🚀 Installation

```bash
npm install @cauth/core
# or
yarn add @cauth/core
# or
pnpm add @cauth/core
```

---

## 🏁 Quick Start

Initialize CAuth by providing your database and route contractors, along with configuration for JWTs and roles.

```typescript
import { CAuth } from '@cauth/core';
import { PrismaContractor } from '@cauth/prisma';
import { ExpressContractor } from '@cauth/express';
import { prisma } from './db';

const auth = CAuth({
  // Define your application roles
  roles: ['USER', 'ADMIN', 'EDITOR'] as const,
  
  // Pluggable contractors
  dbContractor: new PrismaContractor(prisma),
  routeContractor: new ExpressContractor(),

  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenLifeSpan: '15m',   // ms, string (ms format), or number
    refreshTokenLifeSpan: '7d',
  },

  otpConfig: {
    expiresIn: 300000, // 5 minutes in ms
    length: 6,         // 6-digit codes
  },
});

export default auth;
```

### Basic Login Example

```typescript
const result = await auth.FN.Login({
  email: 'dev@example.com',
  password: 'SecurePassword123!',
});

if (result.success) {
  console.log('Tokens:', result.value); // { accessToken, refreshToken, user }
} else {
  console.error('Errors:', result.errors); // Array of FNError objects
}
```

---

## 📖 Core Concepts

### 1. Functional Namespace (`FN`)
The `FN` namespace contains the core business logic functions. These are framework-agnostic and can be used in CLI tools, background jobs, or custom route handlers.

- `auth.FN.Register(data)`: Create new accounts.
- `auth.FN.Login(credentials)`: Authenticate and get tokens.
- `auth.FN.Logout({ refreshToken })`: Revoke a session.
- `auth.FN.Refresh({ refreshToken })`: Get a new access token.
- `auth.FN.ChangePassword(data)`: Update password with old password verification.
- `auth.FN.RequestOTPCode(data)`: Generate and send (via callback) an OTP.
- `auth.FN.LoginWithOTP(data)`: Passwordless login via code.

### 2. Routes Namespace (`Routes`)
The `Routes` namespace provides pre-built handlers for your chosen framework (e.g., Express). These wrap the `FN` logic and handle HTTP plumbing (status codes, body parsing).

```typescript
// Express example
app.post('/auth/register', auth.Routes.Register());
app.post('/auth/login', auth.Routes.Login());
```

### 3. Middleware (`Guard`)
Protect your routes with type-safe RBAC.

```typescript
// Only Admins can access this
app.get('/admin/stats', auth.Guard(['ADMIN']), (req, res) => {
  console.log('Admin ID:', req.cauth.id);
  res.send('Secret data');
});
```

---

## 🔒 Security Considerations

### Password Hashing
CAuth uses **Argon2id**, the winner of the Password Hashing Competition. It provides excellent resistance against GPU/ASIC cracking and side-channel attacks.

### Refresh Token Security
Refresh tokens are stored as **HMAC hashes** in your database. Even if your database is compromised, attackers cannot use the stored hashes to generate valid refresh tokens.

### OTP Generation
OTPs are generated using `node:crypto`'s `randomInt`, ensuring they are not predictable by attackers.

---

## 🛠️ API Reference

### `CAuthOptions`
| Property | Type | Description |
| :--- | :--- | :--- |
| `dbContractor` | `DatabaseContract` | Implementation of database logic (e.g., `PrismaContractor`). |
| `routeContractor` | `RoutesContract` | Implementation of framework logic (e.g., `ExpressContractor`). |
| `roles` | `string[]` | Array of valid role strings. |
| `jwtConfig` | `JWTConfig` | Secret keys and lifespans for tokens. |
| `otpConfig` | `OTPConfig` | (Optional) Expiry and length for OTP codes. |

---

## 📄 License

MIT © [Jonace Mpelule](https://github.com/jonace-mpelule)
