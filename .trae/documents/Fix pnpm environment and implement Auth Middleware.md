I encountered a `pnpm` store location error which prevented installing the `jose` library. I need to fix the dependencies first.

### Plan:

1.  **Fix Environment**:
    - Run `pnpm install` in the project root to resolve the "Unexpected store location" error and relink dependencies.
2.  **Resume Feature Implementation (AUTH-010)**:
    - Install `jose` in `apps/backend`.
    - Create `apps/backend/middleware.ts` to intercept requests and verify JWT tokens.
    - Create `getUserId` helper in `apps/backend/lib/auth.ts`.
    - Refactor `apps/backend/app/api/users/me/route.ts` to use the middleware-provided headers.
3.  **Verification**:
    - Test the login flow and ensure `/api/users/me` still works correctly.

I will ensure to answer 'y' if any command prompts for confirmation.
