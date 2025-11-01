## Onboarding & Admin user flows

This document explains how to test and configure the two onboarding flows used by TransitCare:

- Public passenger sign-up (via Clerk) with backend onboarding
- Admin-created users (invite flow) using the backend and Clerk API

Environment variables (backend .env)

- `MONGODB_URI` - MongoDB connection string
- `CLERK_API_KEY` - Clerk server API key (keep secret)
- `ADMIN_SECRET` - A strong secret used for quick admin auth fallback

Endpoints

- POST /api/users/onboard
  - Called by the frontend after Clerk sign-in. Payload: { clerkId, email, firstName?, lastName? }
  - Upserts a local `User` document (default role: passenger).

- POST /api/admin/create-user
  - Creates a Clerk user and a local `User` record with the specified role (admin|officer).
  - Protected: requires either `x-admin-secret: <ADMIN_SECRET>` header OR a valid Clerk session token in `Authorization: Bearer <token>` where the corresponding local user is an admin.

Quick curl examples

1) Onboard (simulate frontend)

```bash
curl -X POST http://localhost:3001/api/users/onboard \
  -H 'Content-Type: application/json' \
  -d '{"clerkId":"user_123","email":"user@example.com","firstName":"Test","lastName":"User"}'
```

2) Admin create user (using ADMIN_SECRET)

```bash
curl -X POST http://localhost:3001/api/admin/create-user \
  -H 'Content-Type: application/json' \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -d '{"email":"new.officer@example.com","firstName":"Officer","lastName":"One","role":"officer"}'
```

3) Admin create user (using Clerk session token)

Obtain a Clerk session token on the frontend (e.g., clerkClient.getToken()) and send it in the Authorization header.

```bash
curl -X POST http://localhost:3001/api/admin/create-user \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <CLERK_SESSION_TOKEN>' \
  -d '{"email":"new.admin2@example.com","firstName":"Admin","lastName":"Two","role":"admin"}'
```

Notes

- For production, prefer verifying Clerk sessions using the official Clerk middleware and restricting admin operations to authenticated admin users (not only ADMIN_SECRET).
- Store `CLERK_API_KEY` and `ADMIN_SECRET` securely (vault or CI secrets). Never commit them.
