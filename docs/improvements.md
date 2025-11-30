# Design Improvements: `cauth` Package

## Executive Summary

This document outlines architectural and design improvements for the `cauth` package. The goal is to enhance extensibility, developer experience, and maintainability without compromising the core functionality.

## 1. Centralized Logic (DRY Principle)

**Observation:**
The authentication logic is currently duplicated between the Core functions (`packages/core/src/fn/*.fn.ts`) and the Express routes (`packages/express/src/routes/*.route.ts`). The Express routes re-implement the logic (validation, DB calls, hashing) instead of calling the Core functions.

**Improvement:**
Refactor the Express routes to act as thin controllers that simply parse the request, call the corresponding Core function, and map the result to an HTTP response.

**Benefit:**
-   Single source of truth for business logic.
-   Easier testing of core logic independent of the web framework.
-   Reduces the risk of inconsistencies.

## 2. Flexible Database Contract

**Observation:**
The `DatabaseContract` is tightly coupled to a specific `AuthModel` structure (expecting `email`, `phoneNumber`, `passwordHash`, `role` fields). This makes it difficult to integrate `cauth` into existing applications with different user schemas.

**Improvement:**
-   Introduce a "Field Mapper" or configuration object to map `cauth` internal fields to the user's database columns.
-   Allow the `AuthModel` to be generic, so users can define their own user shape.

**Benefit:**
-   Increases adoption by supporting legacy or custom database schemas.

## 3. Event-Driven Architecture (Hooks)

**Observation:**
There is currently no mechanism for users to tap into the authentication lifecycle (e.g., sending a welcome email after registration, logging login attempts to an analytics service) without modifying the package code or wrapping the functions manually.

**Improvement:**
Implement a Hook system or Event Emitter.
-   `onRegister(user)`
-   `onLogin(user)`
-   `onPasswordChange(user)`

**Benefit:**
-   Greatly improves extensibility.
-   Keeps the core package lightweight while allowing complex user workflows.

## 4. Enhanced Configuration & Dependency Injection

**Observation:**
The "Contractor" pattern requires passing `config` and `tokens` to every function call. While functional, it can be verbose.

**Improvement:**
-   Consider a class-based approach for the Core where dependencies are injected via the constructor and stored as private members.
-   The `CAuth` class already does this partially, but the individual functions (`LoginFn`, etc.) still take dependencies as arguments.

**Benefit:**
-   Cleaner function signatures.
-   Easier to mock dependencies for testing.

## 5. Standardized Error Handling

**Observation:**
The `Result` type (`ok` / `fail`) is a good pattern, but the error shapes and handling in the Express layer could be more consistent.

**Improvement:**
-   Ensure all Core functions return a consistent `Result<T, E>`.
-   Create a utility in the Express package to automatically map `CAuthErrors` to HTTP status codes (e.g., `CredentialMismatch` -> 401, `InvalidData` -> 400).

**Benefit:**
-   Reduces boilerplate in route handlers.
-   Ensures consistent API responses.

## 6. Abstracting "Roles" to "Claims"

**Observation:**
The system assumes a simple Role-Based Access Control (RBAC) with a single `role` string. Complex apps often need permissions (e.g., `can_edit_posts`) or multiple roles.

**Improvement:**
-   Change `role` to `claims` or `permissions` (array of strings).
-   Update `Guard` to check for specific permissions rather than just roles.

**Benefit:**
-   Supports more complex authorization models (ABAC, PBAC).

## 7. Testing Strategy

**Observation:**
The codebase lacks a comprehensive test suite.

**Improvement:**
-   Add unit tests for all Core functions using mocked `DatabaseContract`.
-   Add integration tests for the Express routes.

**Benefit:**
-   Ensures stability and prevents regressions during refactoring.
