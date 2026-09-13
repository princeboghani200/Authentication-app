# JWT Authentication Demo — Node.js

An end-to-end demonstration of implementing authentication in a Node.js application — starting from a raw HTTP server with no auth at all, through session-based authentication, and finally to JWT-based authentication with access/refresh token rotation.

## The Core Problem

HTTP is a stateless protocol — every request is independent, and the server has no memory of previous requests. So when you log into an app like Gmail, and it doesn't ask for your password again on the next page load, *something* has to be bridging that gap. This project builds that "something" twice, two different ways, and compares them honestly.

## Project Structure

```
jwt-auth-backend/
  middleware/
    middleware.js       # JWT verification middleware
  .env                   # secrets (not committed)
  .gitignore
  server.js              # Express app, routes, auth logic
  package.json

jwt-auth-frontend/
  src/
    api.js               # centralized axios calls to the backend
    Login.js             # login form
    PrivatePage.js        # protected page, handles token refresh
    App.js                # top-level auth state
  package.json
```

## Stages Implemented

| Stage | What it covers |
|---|---|
| 1–2 | Raw Node `http` server — no routing, no framework, no auth. Demonstrates statelessness directly: hitting `/private` behaves identically whether or not you've "logged in." |
| 3 | Rewritten in Express.js — routing, JSON body parsing, and cleaner responses replace the manual boilerplate. |
| 4 | **Session-based auth** using `express-session` + `cookie-parser`. Login creates a server-side session; the browser holds a `connect.sid` cookie and sends it automatically on every request. |
| 5 | Critique of sessions: in-memory storage grows with every user, a server restart logs everyone out, and it doesn't scale across multiple server instances without a shared store (e.g. Redis) or sticky sessions. |
| 6–7 | **JWT-based auth** using `jsonwebtoken`. Login issues a signed token containing the user's identity; the server verifies the signature on each request with no lookup or shared storage needed. |
| 8 | Hardening: secrets moved to `.env` (`dotenv`), passwords hashed with `bcrypt`, an access + refresh token pattern (short-lived access token, longer-lived revocable refresh token) to allow early logout, `helmet` for security headers, and rate limiting on `/login`. |
| 9 | A minimal React frontend wired up to the backend — login form, a protected page, and a silent token-refresh-on-expiry flow. |

## Session Auth vs JWT Auth — the actual trade-off

| | Session-based | JWT-based |
|---|---|---|
| Where identity lives | Server memory (or Redis/DB) | Inside the signed token itself |
| Per-request cost | Requires a store lookup | Just signature verification — no lookup |
| Scales across multiple servers | Needs a shared store or sticky sessions | Any server with the same secret can verify independently |
| Server restart | Logs everyone out (if in-memory) | Tokens remain valid until they expire |
| Revoking access early | Trivial — delete the session | Not built in — requires a workaround (e.g. a refresh-token blacklist, which is what Stage 8 adds) |
| Payload visibility | Not exposed to the client | Base64-encoded, readable by anyone (never encrypted) — never put secrets in it |

Neither is strictly "better" — JWT solves the scaling and lookup-cost problems, at the cost of making early revocation harder, which is why real systems combining both a short-lived access token and a revocable refresh token exist.

## Running It Locally

**Backend:**
```bash
cd jwt-auth-backend
npm install
node server.js
```
Runs on `http://localhost:3000`.

**Frontend:**
```bash
cd jwt-auth-frontend
npm install
npm start
```
Runs on `http://localhost:3001` (or whichever port it picks — update the `cors` origin in `server.js` to match).

**Environment variables** (`.env` in the backend folder):
```
SECRET_KEY=your-long-random-access-token-secret
REFRESH_KEY=your-long-random-refresh-token-secret
PORT=3000
```

## API Endpoints

| Method | Route | Auth required | Description |
|---|---|---|---|
| GET | `/public` | No | Open to anyone |
| POST | `/login` | No | Body: `{ userId, password }` → returns `accessToken` + `refreshToken` |
| GET | `/private` | Yes (`Authorization: Bearer <accessToken>`) | Protected resource |
| POST | `/refresh` | No (uses refresh token in body) | Body: `{ refreshToken }` → returns a new `accessToken` |
| POST | `/logout` | No | Body: `{ refreshToken }` → revokes that refresh token |

## Known Limitations / Next Steps

- The single hardcoded `USER` object should be replaced with a real database (MongoDB via Mongoose) to support multiple users and a signup flow.
- Refresh tokens are tracked in a plain in-memory array — this means, just like the session store in Stage 4, a server restart clears all revocation state. A production version would use Redis or a database table instead.
- Tokens are stored in `localStorage` on the frontend for simplicity. A production app would prefer httpOnly cookies, particularly for the refresh token, to reduce exposure to XSS.

## What This Project Actually Demonstrates

Beyond "implementing JWT," the point of building both the session and JWT versions side by side — and hitting real bugs along the way (mismatched secrets between files, `const` vs `let`, middleware ordering, CORS port conflicts) — was to actually *feel* why stateless authentication is designed the way it is, rather than just memorizing that "JWT is better than sessions."
