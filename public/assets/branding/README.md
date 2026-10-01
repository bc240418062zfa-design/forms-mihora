# MIHORA Tech — Centralized Branding Assets

This directory houses the authoritative branding assets for the MIHORA Tech Candidate Profile Portal:

- `logo.svg`: Vector logo with scalable network geometric constellation and wordmark.
- `logo.png`: High-resolution bitmap fallback.

To update or replace the official MIHORA Tech logo in production:
1. Drop your official `logo.png` or `logo.svg` into this directory `/public/assets/branding/`.
2. All components consume branding centrally via `src/config/branding.ts` and `src/components/brand/MihoraLogo.tsx`.
3. No code changes across pages or components are required.
