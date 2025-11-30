# Security Audit Report: `cauth` Package

## Executive Summary

This document outlines the security vulnerabilities identified during the audit of the `cauth` package. The audit focused on the core authentication logic, token management, and database interactions.

**Critical Findings:**
- **Insecure OTP Generation:** Use of `Math.random()` makes OTPs predictable.
- **Insecure Token Storage:** Refresh tokens are stored in plaintext in the database.
- **Code Duplication:** Core logic is duplicated between `core` functions and `express` routes, leading to maintenance risks and potential inconsistencies.

## Vulnerabilities

### 1. Insecure OTP Generation (Critical)

**Location:** `packages/prisma/src/prisma-provider.ts` (Lines 36-38)

**Description:**
The OTP generation logic uses `Math.random()`, which is not cryptographically secure. Attackers can potentially predict future OTPs if they can observe enough previous values.

```typescript
// Current Implementation
const code = Array.from({ length: otpLength }, () =>
    Math.floor(Math.random() * 10),
).join('');
```

**Risk:** High. Allows attackers to bypass OTP authentication.

### 2. Plaintext Refresh Token Storage (High)

**Location:** `packages/prisma/src/prisma-provider.ts` (Lines 196-198)

**Description:**
Refresh tokens are stored as raw strings in the `refreshTokens` array in the database. If the database is compromised, attackers can use these tokens to impersonate users.

```typescript
// Current Implementation
refreshTokens: {
    push: args.refreshToken,
},
```

**Risk:** High. A database leak results in full account compromise for all active sessions.

### 3. Account Enumeration (Medium)

**Location:** `packages/core/src/fn/register.fn.ts` (Lines 50-53) & `packages/express/src/routes/register.route.ts` (Lines 43-45)

**Description:**
The registration process returns a specific error (`DuplicateAccountError` / `DuplicateAccount`) if an account with the given email or phone number already exists. This allows attackers to verify if a user is registered on the platform.

**Risk:** Medium. Privacy violation and aids in targeted phishing attacks.

### 4. Code Duplication (Medium)

**Location:** `packages/core/src/fn/*.fn.ts` vs `packages/express/src/routes/*.route.ts`

**Description:**
The authentication logic (Login, Register, etc.) is implemented twice: once in the core functions and again in the Express routes. This violates the DRY (Don't Repeat Yourself) principle and increases the risk of security patches being applied to one implementation but missed in the other.

**Risk:** Medium. Increases maintenance burden and likelihood of inconsistencies.

### 5. Inconsistent Password Hashing (Low)

**Location:** `packages/core/src/fn/login.fn.ts` (bcrypt) vs `packages/core/src/fn/authenticate.fn.ts` (Bun.password)

**Description:**
The codebase mixes `bcrypt` (via the `bcrypt` package) and `Bun.password` (which uses Argon2 by default). While both are secure, inconsistent usage can lead to confusion and configuration issues.

**Risk:** Low. Mainly a code quality issue.

## Action Plan

### Phase 1: Critical Fixes (Immediate)

1.  **Fix OTP Generation:**
    -   Replace `Math.random()` with `crypto.getRandomValues()` or a dedicated library like `otp-generator` (configured securely).
    -   Ensure the generated code is cryptographically random.

2.  **Hash Refresh Tokens:**
    -   Update the database schema to store hashed refresh tokens.
    -   Update `updateAccountLogin` to hash the token before storing.
    -   Update `VerifyRefreshToken` (or the logic that uses it) to verify against the hash. *Note: This requires a migration strategy for existing tokens.*

### Phase 2: Structural Improvements

3.  **Refactor Express Routes:**
    -   Update `packages/express/src/routes/*.route.ts` to call the corresponding functions in `packages/core/src/fn/*.fn.ts` instead of re-implementing the logic.
    -   This ensures a single source of truth for authentication logic.

### Phase 3: Security Enhancements

4.  **Mitigate Account Enumeration:**
    -   Modify `RegisterFn` and `RegisterRoute` to return a generic success message or handle duplicates silently (e.g., send an email saying "Someone tried to register..."). *Note: This impacts UX, so decide based on product requirements.*

5.  **Standardize Hashing:**
    -   Choose one hashing library (preferably `Bun.password` if the environment supports it, as Argon2 is superior) and use it consistently.

6.  **Implement Rate Limiting:**
    -   Add rate limiting to the OTP verification endpoint and Login/Register endpoints to prevent brute-force attacks.

## Example Fixes

### Secure OTP Generation

```typescript
import { randomInt } from 'crypto'; // Or Bun.randomInt

const code = Array.from({ length: otpLength }, () =>
    randomInt(0, 10)
).join('');
```

### Hashing Refresh Tokens

```typescript
// In prisma-provider.ts
const hashedRefreshToken = await Bun.password.hash(args.refreshToken);
// Store hashedRefreshToken
```
