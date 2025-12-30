I will implement the **Authentication Middleware** (`AUTH-010`) for the backend. This middleware will intercept requests to protected API routes, verify the JWT token, and ensure only authenticated users can access them.

### Plan:

1.  **Environment Setup**:
    - Fix the Git "dubious ownership" issue.
    - Install `jose` library in `apps/backend` (required for Edge Middleware JWT verification).
2.  **Implementation**:
    - Create `apps/backend/middleware.ts`:
      - Define protected route patterns (e.g., `/api/*` excluding auth/public endpoints).
      - Verify `Authorization: Bearer <token>` using `jose`.
      - Pass the authenticated `userId` to route handlers via a custom header (`x-user-id`).
    - Create a helper `getUserId(req)` in `apps/backend/lib/auth.ts` (or similar) to easily read the user ID from headers.
3.  **Refactor & Verify**:
    - Update `apps/backend/app/api/users/me/route.ts` to use this new middleware mechanism instead of manual token verification.
    - Verify the flow by logging in (using existing API) and then accessing `/api/users/me`.
4.  **Documentation**:
    - Update `features.json` and `progress.md`.

This task unifies authentication logic and secures the API for future features.
