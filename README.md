# CAuth

A modular authentication system for Node.js applications with TypeScript support.

## Features

- **Type-Safe Authentication**: Built with TypeScript and Zod validation
- **JWT-Based Authentication**: Access and refresh token management
- **Role-Based Access Control**: Flexible role management system
- **Multi-Factor Authentication**: OTP-based two-factor authentication
- **Phone Number Support**: E.164 format validation using libphonenumber-js
- **Error Handling**: Comprehensive error types and handling
- **Modular Design**: Pluggable database and route contractors

## Packages

- [@cauth/core](./packages/core): Core authentication library
- [@cauth/express](./packages/express): Express.js integration
- [@cauth/prisma](./packages/prisma): Prisma database provider

## Quick Start

1. Install required packages:

```bash
npm install @cauth/core @cauth/express @cauth/prisma @prisma/client
# or
yarn add @cauth/core @cauth/express @cauth/prisma @prisma/client
# or
pnpm add @cauth/core @cauth/express @cauth/prisma @prisma/client
```

2. Add authentication models to your Prisma schema:

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

// ADD AS MANY PURPOSES YOU WISH, BUT DON'T REMOVE RESET_PASSWORD AND LOGIN
enum OtpPurpose {
  LOGIN
  RESET_PASSWORD
  ACTION
}

```

3. Generate Prisma Client:

```bash
npx prisma generate
```

4. Set up authentication in your Express app:

```typescript
import express from 'express';
import { CAuth } from '@cauth/core';
import { ExpressContractor, Guard } from '@cauth/express';
import { PrismaProvider } from '@cauth/prisma';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// Initialize CAuth
const auth = CAuth({
  roles: ['USER', 'ADMIN'],
  dbContractor: new PrismaProvider(prisma),
  routeContractor: new ExpressContractor(),
  jwtConfig: {
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    accessTokenLifeSpan: '15m',
    refreshTokenLifeSpan: '7d',
  },
  otpConfig: {
    expiresIn: 300000, // 5 minutes
    length: 6,
  },
});
app.post('/register', CAuthClient.Routes.Register())

app.post('/login', CAuthClient.Routes.Login())

// Using the Guard to extract the id from the user's request
app.post('/change-password', CAuthClient.Guard(),  (req: Request, res: Response) => CAuth.Guard(), CAuthClient.Routes.ChangePassword(req.cauth?.id!)(req, res))


app.post('/refresh', CAuthClient.Routes.Refresh())

app.post('/logout', CAuthClient.Routes.Logout())

app.post('/login-with-code', async (req: Request, res: Response) => {
    const result = await CAuthClient.FN.LoginWithOTP({ phoneNumber: req.body.phone, code: req.body.code })

    return res.send(result)

})

// Protected route example
app.get('/protected', CAuthClient.Guard(), (req, res) => {
  // User data is available in req.user
  res.json({ message: 'Protected data', user: req.user });
});

// Role-based protection
app.get('/admin', Guard(['ADMIN']), (req, res) => {
  res.json({ message: 'Admin only', user: req.user });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Development

### Prerequisites

- Node.js >= 18
- TypeScript >= 5.9
- pnpm >= 8.0

### Building

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/jonace-mpelule/cauth).