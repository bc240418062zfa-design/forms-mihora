# MIHORA Tech — Production-Grade Candidate Profile Portal

Official production repository for **MIHORA Tech Careers**:
- **Candidate Portal**: `https://careers.mihora.tech`
- **Admin Console**: `https://careers.mihora.tech/admin`
- **Corporate Main**: `https://mihora.tech`

---

## 1. System Architecture Overview

The portal implements an enterprise-grade, full-stack candidate profile management and engineering talent registry system:

```text
Browser Client (React 19 / Vite / Tailwind CSS v4)
      │
      ▼
Node.js + Express Server API (Helmet Security, Cookie Parser, Sanitized Error Handler)
      │
 ┌────┴───────────────────────────┬────────────────────────────┐
 │                                │                            │
 ▼                                ▼                            ▼
Authentication & RBAC         Real-Time Event Layer     Export Engine
(bcryptjs salt=12, JWT)       (Server-Sent Events)      (jspdf, Streaming CSV & JSON)
 │                                │                            │
 └───────────────┬────────────────┴────────────────────────────┘
                 ▼
      PostgreSQL Database
      (Heroku Postgres pg.Pool with SSL in Production; PGlite in Local Dev)
      - users (Email, Password Hash, RBAC Role)
      - candidates (Reference Code, Location, Roles, Commute, Compensation)
      - candidate_experiences (Relational employment records)
      - candidate_education (Relational academic records)
      - candidate_skills (Structured skills with proficiency)
      - audit_logs (Complete immutable audit trail)
```

---

## 2. Key Capabilities

### For Candidates
1. **Persistent Account**: Sign in with email and password (passwords hashed using industry-standard bcrypt with 12 salt rounds; never stored in plaintext).
2. **Comprehensive Structured Profile**:
   - Legal & preferred identification, location (country, state, city, locality).
   - Primary role, secondary roles, multi-role capability, professional category, seniority level.
   - Relational career experiences and academic credentials.
   - Technical and domain skills with verified proficiency levels.
   - Work mode preferences (Remote, Hybrid, On-site, Flexible) and relocation willingness.
   - **On-Site Deployment & Commute Parameters**: Max commute distance (km), max commute time (mins), accommodation requirement threshold (km), and transportation requirements.
   - Structured compensation expectations (amount, currency, period, negotiability).
   - Employment availability (notice period in days, shift readiness: day, evening, night, rotating, weekend, overtime).
   - Professional portfolio links (LinkedIn, GitHub, custom URLs).
3. **Dynamic Profile Completeness**: Real-time score (0–100%) calculated directly across all genuine profile sections, without fake requirements or unbacked storage.
4. **PDF Dossier Export**: Generate and download official MIHORA Tech PDF dossiers with branded headers and structured tables.

### For Authorized Administrators
1. **Role-Based Access Control (RBAC)**: Support for `SUPER_ADMIN`, `ADMIN`, and `VIEWER`. Candidates are strictly prevented from querying administrative endpoints.
2. **Real-Time Live Updates**: Server-Sent Events (SSE) stream (`/api/realtime/admin-stream`) notifies active admins of new candidate registrations and profile updates without manual page refreshing.
3. **Database-Driven Dashboard**: Zero fake data or simulated charts. Clean empty states when database is fresh.
4. **Server-Side Search & Filtration**: Query by keyword (name, role, email, city, reference ID), role title, seniority, employment status, and completion score.
5. **Real Exports**:
   - **CSV**: Streaming filtered candidate datasets with full escaping.
   - **JSON**: Full hierarchical relational candidate records.
   - **PDF**: Individual branded candidate dossiers.
6. **Audit Logs**: Immutable log of registrations, logins, profile inspections, and exports.

---

## 3. Technology Stack

- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Backend Framework**: Express 4 with TypeScript (`tsx`)
- **Frontend Framework**: React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Database**: PostgreSQL (via `pg.Pool` with SSL in production; embedded `@electric-sql/pglite` in standalone development)
- **Security & Auth**: `bcryptjs` (salt 12), `jsonwebtoken`, `helmet`, `cookie-parser`
- **Export Engines**: `jspdf` (vector PDF), native streaming CSV/JSON

---

## 4. Environment Variables (`.env.example`)

| Variable | Type | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Auto | Assigned dynamically by Heroku dyno router | `process.env.PORT` (local fallback `3000`) |
| `DATABASE_URL` | Auto | Injected automatically by Heroku Postgres | `postgres://user:pass@host:5432/dbname` |
| `NODE_ENV` | Required | Set to `production` on Heroku | `production` |
| `APP_URL` | Required | Canonical production URL | `https://careers.mihora.tech` |
| `SESSION_SECRET` | Required | 32+ byte cryptographic secret for JWT signing | `openssl rand -hex 32` |
| `ADMIN_SETUP_SECRET` | Required | Key for initial admin bootstrap authorization | `openssl rand -hex 24` |

---

## 5. Local Setup & Running Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Environment
```bash
cp .env.example .env
# For local dev, DATABASE_URL may remain empty to use embedded PostgreSQL (PGlite)
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 6. Heroku Production Deployment Instructions

For complete details, see [docs/DEPLOYMENT_HEROKU.md](docs/DEPLOYMENT_HEROKU.md).

```bash
# 1. Create Heroku application
heroku create mihora-careers --region eu

# 2. Attach Heroku Postgres
heroku addons:create heroku-postgresql:essential-0 -a mihora-careers

# 3. Configure production environment variables
heroku config:set NODE_ENV=production -a mihora-careers
heroku config:set APP_URL=https://careers.mihora.tech -a mihora-careers
heroku config:set SESSION_SECRET="$(openssl rand -hex 32)" -a mihora-careers
heroku config:set ADMIN_SETUP_SECRET="$(openssl rand -hex 24)" -a mihora-careers

# 4. Deploy code
git push heroku main

# 5. Run PostgreSQL database migrations
heroku run npm run migrate -a mihora-careers

# 6. Bootstrap initial administrator securely via CLI
heroku run npm run setup-admin -- -a mihora-careers
```

---

## 7. Future Document Storage Architecture Note

In this production release, unbacked file storage has been removed. Ephemeral dyno filesystems are not used for permanent candidate records. The relational schema is structured so that Google Drive integration or persistent cloud object storage can be integrated in a future release without redesigning candidate profiles or workflows.
