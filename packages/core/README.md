# @cauth/core

Core authentication library for Node.js applications with TypeScript support.

## Features

- **Type-Safe Authentication**: Built with TypeScript and Zod validation
- **JWT-Based Authentication**: Access and refresh token management
- **Role-Based Access Control**: Flexible role management system
- **Multi-Factor Authentication**: OTP-based two-factor authentication
- **Phone Number Support**: E.164 format validation using libphonenumber-js
- **Error Handling**: Comprehensive error types and handling
- **Modular Design**: Pluggable database and route contractors

## Installation

```bash
npm install @cauth/core
# or
yarn add @cauth/core
# or
pnpm add @cauth/core
```

## Quick Start

```typescript
import { CAuth } from '@cauth/core';
import { PrismaProvider } from '@cauth/prisma';
import { ExpressContractor } from '@cauth/express';

// Initialize authentication system
const auth = CAuth({
  roles: ['USER', 'ADMIN'],
  dbContractor: new PrismaProvider(prismaClient),
  routeContractor: new ExpressContractor(),
  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenLifeSpan: '15m',
    refreshTokenLifeSpan: '7d',
  },
  otpConfig: {
    expiresIn: 300000, // 5 minutes
    length: 6, // 6-digit OTP codes
  },
});

// Use authentication functions
const result = await auth.FN.Login({
  email: 'user@example.com',
  //or phoneNumber: '+2659900000'
  password: 'securepassword123',
});

if (result.success) {
  console.log('Login successful:', result.value);
} else {
  console.log('Login failed:', result.errors); // FNErrors[]
}
```

## Core Components

### Authentication Functions

The `FN` namespace provides these authentication functions:

```typescript
auth.FN.Login({ email?: string, phoneNumber?: string, password: string })
auth.FN.Register({ email?: string, phoneNumber?: string, password: string, role: string })
auth.FN.Logout({ refreshToken: string })
auth.FN.Refresh({ refreshToken: string })
auth.FN.ChangePassword({ oldPassword: string, newPassword: string })
auth.FN.RequestOTPCode({ email?: string, phoneNumber?: string, otpPurpose: OtpPurpose })
auth.FN.LoginWithOTP({ email?: string, phoneNumber?: string, code: string })
auth.FN.VerifyOTP({ id: string, code: string, otpPurpose: OtpPurpose })
```

### Token Management

The `Tokens` namespace provides these utilities:

```typescript
auth.Tokens.GenerateAccessToken(payload: any): Promise<string>
auth.Tokens.GenerateRefreshToken(payload: any): Promise<string>
auth.Tokens.GenerateTokenPairs(payload: any): Promise<{ accessToken: string, refreshToken: string }>
auth.Tokens.VerifyAccessToken<T>(token: string): Promise<T | null>
auth.Tokens.VerifyRefreshToken<T>(token: string): Promise<T | null>
```

## Configuration

The `CAuthOptions` interface defines the configuration:

```typescript
interface CAuthOptions {
  dbContractor: DatabaseContract;
  routeContractor: RoutesContract;
  roles: string[];
  jwtConfig: {
    refreshTokenSecret: string;
    accessTokenSecret: string;
    accessTokenLifeSpan?: string | number; // ms string or number
    refreshTokenLifeSpan?: string | number; // ms string or number
  };
  otpConfig?: {
    expiresIn?: number; // milliseconds, default: 300000 (5 minutes)
    length?: number; // 4-8 digits, default: 6
  };
}
```

## Error Types

The library provides these error types:

- `CredentialMismatchError`: Invalid login credentials
- `InvalidDataError`: Validation failures
- `AccountNotFoundError`: Account not found
- `InvalidRoleError`: Invalid role assignment
- `InvalidRefreshTokenError`: Invalid/expired refresh token
- `DuplicateAccountError`: Account already exists
- `InvalidOTPCode`: Invalid/expired OTP code

## Development

### Prerequisites

- Node.js >= 18
- TypeScript >= 5.9



## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/jonace-mpelule/cauth).