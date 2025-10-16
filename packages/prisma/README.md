# @cauth/prisma

Prisma integration for CAuth authentication system.

## Features

- **Prisma Integration**: Database provider for CAuth using Prisma
- **Type Safety**: Full TypeScript support with Prisma Client
- **Schema Support**: Ready-to-use Prisma schema for authentication
- **Account Management**: User account CRUD operations
- **Token Management**: Refresh token handling
- **OTP Support**: One-time password functionality

## Installation

```bash
npm install @cauth/prisma @cauth/core @prisma/client
# or
yarn add @cauth/prisma @cauth/core @prisma/client
# or
pnpm add @cauth/prisma @cauth/core @prisma/client
```

## Quick Start

1. Add the authentication models to your Prisma schema:

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
  user          User?
  otp Otp?

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

// ADD AS MANY PURPOSES YOU WISH, BUT DON'T REMOVE RESET_PASSWORD AND LOGIN
enum OtpPurpose {
  LOGIN
  RESET_PASSWORD
  ACTION
}
```

2. Generate Prisma Client:

```bash
npx prisma generate
```

3. Use with CAuth:

```typescript
import { PrismaClient } from '@prisma/client';
import { CAuth } from '@cauth/core';
import { PrismaProvider } from '@cauth/prisma';
import { ExpressContractor } from '@cauth/express';

const prisma = new PrismaClient();

const auth = CAuth({
  roles: ['USER', 'ADMIN'],
  dbContractor: new PrismaProvider(prisma),
  routeContractor: new ExpressContractor(),
  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  }
});
```

## API Reference

### PrismaProvider

The `PrismaProvider` class implements the `DatabaseContract` interface:

```typescript
class PrismaProvider implements DatabaseContract {
  constructor(prisma: PrismaClient);

  // Account Management
  findAccountById<T>({ id, select }: { id: string; select?: any }): Promise<T | undefined>;
  findAccountWithCredential<T>({ email, phoneNumber, select }: { email?: string; phoneNumber?: string; select?: any }): Promise<T | undefined>;
  createAccount<T>({ data, select }: { data: any; select?: any }): Promise<T>;
  updateAccount<T>({ id, data, select }: { id: string; data: any; select?: any }): Promise<T>;
  deleteAccount({ id }: { id: string }): Promise<void>;

  // Token Management
  updateAccountLogin<T>({ id, refreshToken, select }: { id: string; refreshToken: string; select?: any }): Promise<T>;
  removeAndAddRefreshToken({ id, refreshToken, newRefreshToken, select }: { id: string; refreshToken: string; newRefreshToken?: string; select?: any }): Promise<any>;

  // OTP Management
  createOTP<T>({ config }: { config: CAuthOptions }, { id, purpose }: { id: string; purpose: OtpPurpose }): Promise<T>;
  verifyOTP<T>({ id, code, purpose }: { id: string; code: string; purpose: OtpPurpose }): Promise<T>;
}
```

## Development

### Prerequisites

- Node.js >= 18
- TypeScript >= 5.9
- Prisma >= 5.0

### Building

```bash
pnpm install
pnpm build
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/jonace-mpelule/cauth).