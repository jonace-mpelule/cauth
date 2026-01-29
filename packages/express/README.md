# @cauth/express

[![NPM Version](https://img.shields.io/npm/v/@cauth/express.svg)](https://www.npmjs.com/package/@cauth/express)

**CAuth Express** provides seamless integration between the CAuth core authentication system and Express.js applications. It includes type-safe route handlers, middleware, and request augmentation.

> [!IMPORTANT]
> For more information and full documentation, visit **[cauth.dev](https://cauth.dev)**.

---

## ✨ Features

- **🚀 Express Optimized**: Plug-and-play middleware and route handlers.
- **🛡️ Type-Safe Guard**: Protect routes with RBAC that knows your roles.
- **📦 Request Augmentation**: Automatically injects `req.cauth` with user session data.
- **🧩 Flexible**: Use pre-built routes or call core `FN` functions manually.
- **🛡️ Standardized Errors**: Automatically maps core errors to appropriate HTTP status codes.

---

## 🚀 Installation

```bash
npm install @cauth/express @cauth/core
# or
yarn add @cauth/express @cauth/core
```

---

## 🏁 Quick Start

1. Initialize your CAuth client (see `@cauth/core` for full config).
2. Attach the generated routes and middleware to your Express app.

```typescript
import express from 'express';
import auth from './auth'; // Your initialized CAuth instance

const app = express();
app.use(express.json());

// 1. Mount pre-built authentication routes
app.post('/auth/register', auth.Routes.Register());
app.post('/auth/login', auth.Routes.Login());
app.post('/auth/refresh', auth.Routes.Refresh());
app.post('/auth/logout', auth.Routes.Logout());

// 2. Protect routes with the Guard middleware
app.get('/me', auth.Guard(), (req, res) => {
  // Access typed user data from req.cauth
  res.json({ user: req.cauth });
});

// 3. Role-based protection
app.get('/admin', auth.Guard(['ADMIN']), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

// 4. Manual usage in custom routes
app.post('/auth/reset-password', async (req, res) => {
  const result = await auth.FN.RequestOTPCode({
    email: req.body.email,
    otpPurpose: 'RESET_PASSWORD',
    onCode: (code) => {
       // Logic to send code via email
       console.log(`OTP Code: ${code}`);
    }
  });
  
  res.status(result.success ? 200 : 400).send(result);
});

app.listen(3000);
```

---

## 📖 API Reference

### `auth.Guard(roles?: string[])`
A middleware that verifies the Access Token in the `Authorization` header (`Bearer <token>`).

- If no roles are provided, it only checks for a valid session.
- If roles are provided, it checks if the user has one of the specified roles.
- Injects `req.cauth` with `{ id: string, role: string }`.

### `auth.Routes`
A collection of pre-configured Express route handlers:

- **Register**: `POST` handler for user creation.
- **Login**: `POST` handler for credentials-based auth.
- **Logout**: `POST` handler that revokes refresh tokens.
- **Refresh**: `POST` handler for rotating access tokens.
- **ChangePassword**: `POST` handler for updating passwords (requires `userId`).

---

## 🔒 Error Mapping

CAuth Express automatically maps core errors to HTTP status codes:

| Core Error | HTTP Status |
| :--- | :--- |
| `CredentialMismatchError` | 401 Unauthorized |
| `InvalidDataError` | 400 Bad Request |
| `AccountNotFoundError` | 404 Not Found |
| `InvalidRoleError` | 403 Forbidden |
| `DuplicateAccountError` | 409 Conflict |
| `InvalidOTPCode` | 422 Unprocessable Entity |

---

## 📄 License

MIT © [Jonace Mpelule](https://github.com/jonace-mpelule)