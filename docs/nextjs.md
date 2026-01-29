# Next.js Integration Design

This document outlines the design for the `@cauth/next` package, focusing on a configuration-driven, flexible integration with Next.js App Router, Server Actions, and Client Components.

## Core Principles

1.  **Decoupling**: The Next.js package does not talk directly to the database. It communicates with your backend (or API routes) which handles the custom auth logic.
2.  **Configuration**: A central config file to define behavior.
3.  **Modern features**: Native support for Server Actions and `useActionState`.
4.  **Customization**: Full control over UI, you only consume the logic and state.

## Installation

```bash
npm install @cauth/next
```

## Configuration

The package relies on a `cauth.config.ts` file in your project root or `src/lib`.

```ts
import { defineConfig } from "@cauth/next";

export const authConfig = defineConfig({
  // Point to your backend API that handles the actual auth logic (cauth core/express/etc)
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/auth", 
  
  // Optional: Define routes for redirects
  routes: {
    login: "/login",
    afterLogin: "/dashboard",
    afterLogout: "/",
  },
  
  // Optional: Custom fetch implementation (e.g. for adding global headers like API keys)
  fetch: (url, options) => fetch(url, options),
});
```

## Server Side Usage

For middleware or server components, direct access to session data is provided.

```ts
// app/layout.tsx
import { getSession } from "@cauth/next/server";
import { authConfig } from "@/cauth.config";

export default async function Layout({ children }) {
  const session = await getSession(authConfig);
  
  return (
    <html>
      <body>
         <nav>
           {session ? <UserMenu user={session.user} /> : <LoginLink />
           }
         </nav>
         {children}
      </body>
    </html>
  );
}
```

## Client Side & Forms

The package provides utilities to create Server Actions that automatically bind to your configuration and are compatible with React's `useActionState`.

### 1. Define Server Actions

Create a file `app/actions/auth.ts` to define your actions. We provide `createAuthAction` which serves as a factory for standard auth actions.

```ts
"use server";

import { createAuthAction } from "@cauth/next/server";
import { authConfig } from "@/cauth.config";

// connect "login" action to `POST {baseUrl}/login`
export const loginAction = createAuthAction(authConfig, "login"); 

// connect "register" action to `POST {baseUrl}/register`
export const registerAction = createAuthAction(authConfig, "register");

// connect "logout" action to `POST {baseUrl}/logout`
export const logoutAction = createAuthAction(authConfig, "logout");
```

### 2. Create the Login Page

Use the standard `useActionState` hook from React. The state management (loading, errors) is handled naturally by the hook and the response shape of our actions.

```tsx
"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

// Initial state for the reducer
const initialState = {
  success: false,
  error: null,
  fieldErrors: {},
};

export default function LoginPage() {
  // `state` contains the result of the last action
  // `formAction` is the function to call (passed to <form action={...}>)
  // `isPending` is the loading state
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      
      <form action={formAction} className="flex flex-col gap-4">
        {/* Global Error Message */}
        {state?.error && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            {state.error}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input 
            id="email"
            name="email" 
            type="email" 
            required 
            className="border p-2 w-full rounded"
          />
          {/* Field specific error */}
          {state?.fieldErrors?.email && (
            <p className="text-red-500 text-sm mt-1">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input 
            id="password"
            name="password" 
            type="password" 
            required 
            className="border p-2 w-full rounded"
          />
           {state?.fieldErrors?.password && (
            <p className="text-red-500 text-sm mt-1">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

### Action State Shape

The `state` object returned by `useActionState` will always satisfy this interface:

```ts
interface AuthActionState {
  success: boolean;
  message?: string;       // Success message or general info
  error?: string;         // Main error message (e.g. "Invalid credentials")
  fieldErrors?: Record<string, string[]>; // Validation errors (e.g. { email: ["Invalid email"] })
  data?: any;             // Any payload returned by the backend
}
```

## Advanced Usage

### Custom Action Handling

If you need to do more than just specific backend calls (e.g. logging, analytics), you can wrap the action or use the primitives.

```ts
"use server";
import { createAuthAction } from "@cauth/next/server";
import { authConfig } from "@/cauth.config";

const baseLogin = createAuthAction(authConfig, "login");

export async function customLogin(prevState: any, formData: FormData) {
  console.log("Attempting login...");
  const result = await baseLogin(prevState, formData);
  
  if (result.success) {
    console.log("Login success!");
    // You can perform additional server-side logic here
  }
  
  return result;
}
```
