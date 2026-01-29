# @cauth/prisma

[![NPM Version](https://img.shields.io/npm/v/@cauth/prisma.svg)](https://www.npmjs.com/package/@cauth/prisma)

**CAuth Prisma** is the official database adapter for the CAuth authentication system. It provides a robust implementation of the `DatabaseContract` using Prisma Client.

> [!IMPORTANT]
> For more information and full documentation, visit **[cauth.dev](https://cauth.dev)**.

---

## ✨ Features

- **🐘 Prisma Native**: Full support for Prisma 5+ and any database Prisma supports.
- **🛡️ Secure Refresh Tokens**: Automatically handles HMAC hashing of refresh tokens.
- **🔑 Argon2id Integration**: Works seamlessly with CAuth's Argon2id password hashing.
- **📱 OTP Built-in**: Robust schema and logic for managing one-time passwords.
- **🛠️ Type-Safe**: Fully typed database operations and results.

---

## 🚀 Installation

```bash
npm install @cauth/prisma @cauth/core @prisma/client
# or
yarn add @cauth/prisma @cauth/core @prisma/client
```

---

## 🏁 Quick Start

### 1. Define the Schema

Add the following models to your `schema.prisma` file. These models are required for CAuth to function.

```prisma
model Auth {
  id            String   @id @default(cuid())
  phoneNumber   String?  @unique
  email         String?  @unique
  role          String
  passwordHash  String
  lastLogin     DateTime @default(now())
  refreshTokens Json[]   // Stores hashed refresh tokens and metadata
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations (optional but recommended)
  user          User?
  otp           Otp?

  @@map("auth")
}

model Otp {
  id        String     @id // Same as Auth.id
  auth      Auth       @relation(fields: [id], references: [id])
  code      String     // Argon2id hash of the numeric code
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

### 2. Initialize the Contractor

```typescript
import { PrismaClient } from '@prisma/client';
import { CAuth } from '@cauth/core';
import { PrismaContractor } from '@cauth/prisma';
import { ExpressContractor } from '@cauth/express';

const prisma = new PrismaClient();

const auth = CAuth({
  roles: ['USER', 'ADMIN'],
  dbContractor: new PrismaContractor(prisma),
  routeContractor: new ExpressContractor(),
  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  }
});
```

---

## 🔒 Security Features

### Refresh Token Hashing
Unlike basic implementations that store refresh tokens in plaintext, `@cauth/prisma` stores an **HMAC hash** of the token. This ensures that even if your database is leaked, the active sessions cannot be hijacked.

### OTP Security
Numeric codes are never stored in the database. Instead, an **Argon2id hash** of the code is stored, providing the same level of security as passwords.

---

## 🛠️ API Reference

### `PrismaContractor(prisma: PrismaClient)`
The primary class that implements the `DatabaseContract`. It handles:

- **Account CRUD**: Finding, creating, and updating auth accounts.
- **Session Management**: Securely adding/removing/refreshing token hashes.
- **OTP Lifecycle**: Generating CSPRNG codes and verifying them against hashes.

---

## 📄 License

MIT © [Jonace Mpelule](https://github.com/jonace-mpelule)

