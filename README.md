# Student Project Tracker (Live Cloud Variant)

A hands-on web app development project adapted for cloud deployment using **Vercel** (serverless hosting) and **Supabase PostgreSQL** (cloud database).

## Architecture & How It Differs from Local SQLite
- **Backend**: Express app exported from `server.js` (routed via `project-api.js`), designed to run serverless on Vercel or locally with `live-local.js`.
- **Database**: Uses PostgreSQL via the `postgres` driver in `database.js` rather than local `node:sqlite`.
- **Database Schema**: Defined in `schema.sql`. The `projects` table must be created in your PostgreSQL instance prior to launching.
- **Frontend**: Preserves the original HTML, CSS, and client-side JavaScript in `public/`. Calls the same relative `/api/projects` endpoints.
- **Persistence**: Data resides in the cloud database. Note that previous local SQLite rows are not migrated automatically.

## Local Rehearsal Run
To run and test the cloud variant locally against your remote PostgreSQL database:

1. Install dependencies:
   ```powershell
   npm.cmd ci
   ```
2. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```powershell
     Copy-Item .env.example .env
     ```
   - Open `.env` and set `DATABASE_URL` to your private PostgreSQL transaction pooler connection string.
   - *Never commit `.env` or publish database credentials.* `.env` is ignored by `.gitignore`.
3. Apply the database schema:
   - Run the SQL statements from `schema.sql` in your Supabase SQL editor to create the `projects` table.
4. Start the local rehearsal server:
   ```powershell
   npm.cmd start
   ```
5. Open `http://localhost:3000` in your browser. Stop the server with `Ctrl+C`.

## Deployment (Vercel)
- The server entry `server.js` exports the Express app instance (`export default app`) for Vercel's Node runtime.
- Set `DATABASE_URL` in the Vercel project environment variables dashboard.
- **Live Hosted URL**: [To be added after deployment verification]

## Verification
- **Cloud Adapter Setup**: Created `student-project-tracker-live` with frontend assets, `project-api.js`, and the 8 deployment adapter files.
- **Dependency Installation**: Verified clean `npm.cmd ci` with `postgres` and `express`.
- **Environment Isolation**: Configured `.env` locally with server-only `DATABASE_URL`; confirmed secrets are excluded by `.gitignore`.
- **Local Rehearsal**: Verified `npm.cmd start` successfully starts the local rehearsal server using `live-local.js`.

## Limitations
- Designed for educational demonstration without authentication or per-user access control. All users accessing the live application share the same database records.
