# MIHORA Tech — System Architecture Document

## 1. Architectural Layers

### Presentation Layer
- **Candidate Interface (`/`, `/sign-in`, `/register`, `/dashboard`, `/profile`)**:
  - Built with React 19 and Tailwind CSS.
  - Multi-step structured editor with progressive saving and dynamic completion calculation.
  - Client-side PDF generation (`jspdf`) allowing offline dossier compilation.
- **Admin Interface (`/admin`, `/admin/login`)**:
  - Live data grid with server-side pagination, search, and multi-parameter filtration.
  - Server-Sent Events (SSE) listener maintains sync with backend database mutations.
  - Direct secure downloads of uploaded CVs and streaming CSV/JSON export endpoints.

### API & Middleware Layer (Express)
- **Security (`helmet`)**: Strict security headers and CORS protection.
- **Session Management (`cookie-parser` & `jsonwebtoken`)**: Stateless, tamper-proof JWT sessions with HttpOnly cookie support and Bearer header fallback.
- **Authentication Guard**: Verifies candidate identity and ensures candidates cannot query administrative routes.
- **RBAC Guard**: Enforces `SUPER_ADMIN`, `ADMIN`, and `VIEWER` permission boundaries.
- **Upload Handler (`multer`)**: Enforces file extensions, MIME checks, file size cap (10MB), and safe filename generation.

### Persistence Layer (PostgreSQL)
- **Production Mode**: Connects via `pg.Pool` with SSL to external/Heroku PostgreSQL specified in `DATABASE_URL`.
- **Standalone/Development Mode**: Embedded `@electric-sql/pglite` executes genuine PostgreSQL SQL syntax against disk storage in `./data/mihora_pg.db`.
- **Relational Tables**:
  - `users`: Core account identity and hashed credentials.
  - `candidates`: Primary profile, location, commute thresholds, compensation.
  - `candidate_experiences`: Foreign-key linked previous employment history.
  - `candidate_education`: Foreign-key linked academic degrees.
  - `candidate_skills`: Foreign-key linked skills with proficiency levels.
  - `candidate_documents`: Document metadata and physical storage references.
  - `audit_logs`: System access and export events.

### Real-Time Event Layer (SSE)
- Database mutations trigger broadcasts to `/api/realtime/admin-stream`.
- Connected administrators receive lightweight event payloads (`CANDIDATE_REGISTERED`, `PROFILE_UPDATED`, `DOCUMENT_UPLOADED`) and update their local cache automatically without full-page reloads.
