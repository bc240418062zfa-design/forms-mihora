# MIHORA TECH — PRODUCTION HEROKU DEPLOYMENT & VERIFICATION GUIDE

This document provides step-by-step instructions for deploying and running the MIHORA Tech Candidate Profile Portal on Heroku with real PostgreSQL.

---

## 1. Prerequisites

- Heroku CLI installed (`heroku --version`)
- Heroku account with active billing (for Heroku Postgres)
- Git CLI

---

## 2. Step-by-Step Heroku Production Deployment

### Step 1: Create Heroku Application
```bash
heroku create mihora-careers --region eu
```
*(Optionally set your custom domain: `heroku domains:add careers.mihora.tech -a mihora-careers`)*

### Step 2: Provision Heroku PostgreSQL
```bash
heroku addons:create heroku-postgresql:essential-0 -a mihora-careers
```
> **Note on DATABASE_URL**: Heroku Postgres automatically provisions and injects `DATABASE_URL` into your application config vars. You do NOT need to hard-code database credentials. The portal automatically connects via `pg.Pool` using SSL with `rejectUnauthorized: false` for Heroku's self-signed certificates.

### Step 3: Configure Required Production Environment Variables
Set the mandatory production config vars:

```bash
# 1. Enforce production mode
heroku config:set NODE_ENV=production -a mihora-careers

# 2. Canonical application URL
heroku config:set APP_URL=https://careers.mihora.tech -a mihora-careers

# 3. Cryptographic secret for signing tokens (generate a strong 32-byte secret)
heroku config:set SESSION_SECRET="$(openssl rand -hex 32)" -a mihora-careers

# 4. Master key for administrative setup authorization
heroku config:set ADMIN_SETUP_SECRET="$(openssl rand -hex 24)" -a mihora-careers
```

### Step 4: Deploy the Application
Deploy the codebase to Heroku:

```bash
git push heroku main
```

### Step 5: Run Database Migrations
Execute the automated migration script against your Heroku Postgres database:

```bash
heroku run npm run migrate -a mihora-careers
```

Output:
```text
[DB] Connecting to PostgreSQL pool via DATABASE_URL...
[DB] PostgreSQL pool successfully connected and verified.
[DB] Running database migrations...
[DB] Migrations executed successfully.
```

### Step 6: Initialize the Primary Administrator Securely
You can bootstrap your primary administrator either via the secure CLI command on your dyno or through the web interface:

#### Method A: Dyno CLI (Recommended)
```bash
heroku run npm run setup-admin -- -a mihora-careers
```
Or pass credentials non-interactively:
```bash
heroku run npm run setup-admin -- --email="admin@mihora.tech" --password="YourSecurePassword123!" -a mihora-careers
```

#### Method B: Web Setup Portal
Navigate to `https://careers.mihora.tech/admin/login`. Since zero administrators exist in the database initially, the portal prompts you to create the primary `SUPER_ADMIN` credentials. If an administrator already exists, further initialization is locked behind `ADMIN_SETUP_SECRET`.

---

## 3. Production Verification Checklist

Perform these verification steps on your deployed instance:

| Feature / Step | Command / URL | Expected Behavior |
| :--- | :--- | :--- |
| **Health Check** | `GET https://careers.mihora.tech/health` | Returns HTTP 200: `{"status":"healthy","database":{"connected":true,"engine":"PostgreSQL"},"environment":"production"}` |
| **Careers Overview** | `https://careers.mihora.tech/` | Renders branding with updated faceted SVG logo and clear call-to-actions. |
| **Candidate Registration** | `POST /api/auth/register` | Registers candidate, returns JWT token, hashes password using bcrypt (12 rounds). |
| **Profile Persistence** | `PUT /api/candidate/profile` | Saves structured profile into PostgreSQL `candidates` table; dynamic completeness percentage recalculates across the 9 real sections. |
| **Candidate Dossier Export** | Click "Download Official PDF Dossier" | Client compiles and downloads official MIHORA Tech candidate dossier. |
| **Admin Console Sign In** | `https://careers.mihora.tech/admin/login` | Authenticates administrator; candidate accounts are rejected with 403 Forbidden. |
| **Admin Candidate Grid** | `GET /api/admin/candidates` | Returns paginated list of candidates with search, filters, and deployment status. |
| **Real-Time Sync** | `GET /api/realtime/admin-stream` | Connected admins receive real-time SSE broadcasts when candidates register or update profiles. |
| **CSV & JSON Exports** | `GET /api/admin/exports/csv` | Streams CSV and JSON candidate registries with proper escaping. |
| **Dyno Lifecycle & Shutdown** | `heroku restart -a mihora-careers` | Server catches `SIGTERM` and closes PostgreSQL pool cleanly. |

---

## 4. Architecture Note on Document Attachments

In this release, file uploads have been intentionally removed rather than shipping a mock, simulated, or ephemeral file store on Heroku dynos. Candidate data, experiences, education, competencies, and commute parameters persist safely in PostgreSQL. The system is designed to allow Google Drive or cloud storage integration in a future release.
