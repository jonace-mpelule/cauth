# OAuth Implementation Plan

## Overview

This document outlines the plan to add OAuth 2.0 support to the `cauth` package. This will allow users to sign in using third-party providers like Google, GitHub, etc.

## 1. Database Schema Changes

We need to store the link between the local `Auth` account and the external provider.

### New Model: `SocialLogin`

Add the following to `packages/prisma/prisma/schema.prisma`:

```prisma
model SocialLogin {
  id          String   @id @default(uuid())
  provider    String   // e.g., "google", "github"
  providerId  String   // The user's unique ID from the provider
  authId      String
  auth        Auth     @relation(fields: [authId], references: [id])
  
  // Optional: Store tokens if we need to act on behalf of the user later
  // accessToken  String?
  // refreshToken String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([provider, providerId])
}
```

Update the `Auth` model to include the relation:

```prisma
model Auth {
  // ... existing fields
  socialLogins SocialLogin[]
}
```

## 2. Core Package Updates

### 2.1. OAuth Provider Interface

Define a contract for OAuth providers in `packages/core/src/types/oauth.contract.t.ts`:

```typescript
export interface OAuthUserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface OAuthProviderContract {
  name: string;
  getAuthUrl(state: string): string;
  getUserProfile(code: string): Promise<OAuthUserProfile>;
}
```

### 2.2. Database Contract Update

Update `DatabaseContract` to support social logins:

```typescript
export interface DatabaseContract {
  // ... existing methods
  
  findAccountBySocialId(provider: string, providerId: string): Promise<AuthModel | null>;
  
  addSocialLogin(data: { 
    authId: string; 
    provider: string; 
    providerId: string; 
  }): Promise<void>;
}
```

### 2.3. New Functions

Create `packages/core/src/fn/oauth.fn.ts`:

-   `GetOAuthUrlFn`: Generates the redirect URL for the frontend.
-   `LoginWithOAuthFn`:
    1.  Exchanges code for user profile via the Provider.
    2.  Checks DB for existing `SocialLogin`.
    3.  **If exists:** Logs the user in (generates tokens).
    4.  **If new:**
        -   Checks if email exists in `Auth` table.
        -   **If email exists:** Links `SocialLogin` to existing account (optional: require verification).
        -   **If email new:** Creates new `Auth` account and links `SocialLogin`.
    5.  Returns tokens.

## 3. Express Package Updates

### 3.1. New Routes

Create `packages/express/src/routes/oauth.route.ts`:

-   `GET /auth/:provider`: Redirects to the provider's login page.
-   `GET /auth/:provider/callback`: Handles the callback, calls `LoginWithOAuthFn`, and sets cookies/returns tokens.

### 3.2. Configuration

Update `CAuthOptions` to accept OAuth provider configurations:

```typescript
export const CAuthOptionsSchema = z.object({
  // ... existing config
  oauthProviders: z.record(z.custom<OAuthProviderContract>()).optional(),
});
```

## 4. Implementation Steps

1.  **Schema Migration:** Update Prisma schema and generate migrations.
2.  **Core Logic:** Implement the `OAuthProviderContract` and the new functions in `core`.
3.  **Providers:** Implement at least one provider (e.g., Google) as a separate package or helper in `core`.
4.  **Express Routes:** Add the routes to `ExpressContractor`.
5.  **Testing:** Verify the flow with a mock provider.

## 5. Security Considerations

-   **State Parameter:** Must use the `state` parameter in OAuth flows to prevent CSRF.
-   **Account Linking:** Be careful when automatically linking accounts by email. Ensure the email from the provider is verified.
