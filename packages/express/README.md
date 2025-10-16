# @cauth/express

Express integration for CAuth authentication system.

## Features

- **Express Integration**: Seamless integration with Express.js applications
- **Type-Safe Routes**: TypeScript support for route handlers
- **Authentication Middleware**: Ready-to-use authentication guard
- **Request Augmentation**: Typed user data in request object
- **Error Handling**: Express-compatible error handling

## Installation

```bash
npm install @cauth/express @cauth/core
# or
yarn add @cauth/express @cauth/core
# or
pnpm add @cauth/express @cauth/core
```

## Quick Start

```typescript
import express from 'express';
import { CAuth } from '@cauth/core';
import { ExpressContractor, Guard } from '@cauth/express';
import { PrismaContractor } from '@cauth/prisma';

const app = express();
app.use(express.json());

// Initialize CAuth with Express contractor
const CAuthClient = CAuth({
  dbContractor: new PrismaContractor(prismaClient),
  routeContractor: new ExpressContractor(),
  roles: ['USER', 'ADMIN'],
  jwtConfig: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  }
});

//  authentication routes
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

## API Reference


### Guard Middleware

The `Guard` middleware protects routes and adds user data to the request object:

```typescript
// Protect route for authenticated users
app.get('/profile', CAuthCliebt.Guard(), (req, res) => {
  const data = req.cauth; // TypeScript knows user exists
  res.json({ user });
});

// Protect route for specific roles
app.get('/admin', Guard(['ADMIN']), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

### Request Object

The middleware augments the Express `Request` object with user data:

```typescript
interface AuthenticatedRequest extends Request {
  cauth: {
    id: string;
    role: string;
  };
}
```

### Error Handling

Common error status codes:

- 400: Invalid request data
- 401: Unauthorized (invalid credentials)
- 403: Forbidden (insufficient permissions)
- 404: Account not found
- 409: Duplicate account
- 422: Invalid OTP code

## Development

### Prerequisites

- Node.js >= 18
- TypeScript >= 5.9
- Express.js >= 4.18


## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/jonace-mpelule/cauth).