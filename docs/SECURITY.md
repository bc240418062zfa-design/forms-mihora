# MIHORA Tech — Security & Compliance Architecture

## 1. Password Protection & Cryptographic Storage
- Passwords are never stored or logged in plaintext.
- Password hashing is enforced via `bcryptjs` utilizing 12 salt rounds.
- Passwords are never returned in user queries, candidate records, admin endpoints, or export payloads.

## 2. Session Integrity & Token Management
- Authentication uses cryptographically signed JSON Web Tokens (JWT) with HMAC SHA-256 using `SESSION_SECRET`.
- Tokens expire automatically after 7 days.
- In production, cookies are transmitted with `HttpOnly`, `Secure` (HTTPS only), and `SameSite=Lax`.

## 3. Object-Level Authorization & Access Boundaries
- Candidates can only query and mutate their own profile (`user_id = req.user.userId`).
- Direct Object Reference (IDOR) attacks are blocked: candidate endpoints do not accept arbitrary candidate IDs in path parameters for mutations.
- Administrative endpoints (`/api/admin/*`) require explicit verification of `SUPER_ADMIN`, `ADMIN`, or `VIEWER` roles.
- Read-only `VIEWER` accounts are restricted from administrative mutations.

## 4. File Upload & Document Security
- Permitted file extensions: strictly `.pdf`, `.docx`, `.doc`.
- MIME type verification: matches against allowlist (`application/pdf`, Microsoft Word).
- File size limit: 10MB maximum payload.
- Filesystem safety: Safe filenames are generated with random hex suffixes and sanitized base names. Path traversal attempts (`../`) are explicitly blocked.
- Direct static file execution is disabled; files are streamed via authenticated endpoints.

## 5. Audit Logging & Export Protection
- Administrative access to candidate resumes generates an immutable audit record in `audit_logs` tracking timestamp, actor email, and target candidate ID.
- Bulk CSV and JSON exports are authenticated and recorded in the audit trail.
