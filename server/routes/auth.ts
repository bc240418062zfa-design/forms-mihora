import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthenticatedRequest } from '../auth.js';
import { logAuditEvent, formatReferenceCode } from '../utils/audit.js';
import { broadcastAdminEvent } from '../realtime.js';

export const authRouter = Router();

// POST /api/auth/register - Candidate registration
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, acceptTerms } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters in length.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password confirmation does not match.' });
    }

    if (!acceptTerms) {
      return res.status(400).json({ error: 'You must accept the terms and privacy policy to continue.' });
    }

    const db = await getDb();

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    const pwdHash = await hashPassword(password);

    // Register user and candidate in transaction
    const newUser = await db.transaction(async (tx) => {
      const userRes = await tx.query(
        `INSERT INTO users (email, password_hash, role, is_active, last_login_at)
         VALUES ($1, $2, 'CANDIDATE', true, CURRENT_TIMESTAMP)
         RETURNING id, email, role, created_at`,
        [normalizedEmail, pwdHash]
      );
      const user = userRes.rows[0];

      const refCode = formatReferenceCode(user.id);
      await tx.query(
        `INSERT INTO candidates (user_id, reference_code, completion_percentage)
         VALUES ($1, $2, 0)`,
        [user.id, refCode]
      );

      return user;
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Set secure cookie
    res.cookie('mihora_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Record audit event
    await logAuditEvent(db, {
      actorId: newUser.id,
      actorEmail: newUser.email,
      actorRole: newUser.role,
      action: 'CANDIDATE_REGISTERED',
      targetType: 'user',
      targetId: String(newUser.id),
      ipAddress: req.ip,
    });

    // Notify real-time stream
    broadcastAdminEvent({
      type: 'CANDIDATE_REGISTERED',
      candidateId: newUser.id,
      referenceCode: formatReferenceCode(newUser.id),
      name: 'New Candidate',
      primaryRole: 'Unspecified',
      completionPercentage: 0,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    console.error('[API] Register error:', err);
    res.status(500).json({ error: 'An error occurred during account creation. Please try again.' });
  }
});

// POST /api/auth/login - Candidate & general sign in
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();

    const userRes = await db.query(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('mihora_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAuditEvent(db, {
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_LOGIN',
      targetType: 'user',
      targetId: String(user.id),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('[API] Login error:', err);
    res.status(500).json({ error: 'Login failed. Please check credentials and try again.' });
  }
});

// POST /api/auth/admin-login - Dedicated admin authentication
authRouter.post('/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();

    const userRes = await db.query(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const user = userRes.rows[0];

    // Enforce role boundary: candidates cannot use admin login
    if (!['SUPER_ADMIN', 'ADMIN', 'VIEWER'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized. This portal is strictly for MIHORA administrators.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This administrative account is disabled.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('mihora_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAuditEvent(db, {
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'ADMIN_LOGIN',
      targetType: 'user',
      targetId: String(user.id),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('[API] Admin login error:', err);
    res.status(500).json({ error: 'Administrator authentication failed.' });
  }
});

// GET /api/auth/check-admin-status - Checks if any admin account exists (for first-time setup prompt)
authRouter.get('/check-admin-status', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const countRes = await db.query(
      "SELECT COUNT(*) as cnt FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN')"
    );
    const count = parseInt(countRes.rows[0].cnt, 10);
    res.json({ hasAdmin: count > 0 });
  } catch (err: any) {
    console.error('[API] Check admin status error:', err);
    res.status(500).json({ error: 'Failed to verify admin status.' });
  }
});

// POST /api/auth/setup-admin - Secure one-time initial administrator bootstrap
authRouter.post('/setup-admin', async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, setupKey } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 10) {
      return res.status(400).json({ error: 'Admin password must be at least 10 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const db = await getDb();

    // Check if any admin already exists
    const countRes = await db.query(
      "SELECT COUNT(*) as cnt FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN')"
    );
    const existingAdminCount = parseInt(countRes.rows[0].cnt, 10);

    // If an admin exists, require the ADMIN_SETUP_SECRET
    if (existingAdminCount > 0) {
      const serverSecret = process.env.ADMIN_SETUP_SECRET;
      if (!serverSecret || setupKey !== serverSecret) {
        return res.status(403).json({ error: 'An administrator account already exists. Initialization is locked.' });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    const pwdHash = await hashPassword(password);

    if (existingUser.rows.length > 0) {
      await db.query(
        "UPDATE users SET password_hash = $1, role = 'SUPER_ADMIN', is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [pwdHash, existingUser.rows[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, 'SUPER_ADMIN', true)",
        [normalizedEmail, pwdHash]
      );
    }

    await logAuditEvent(db, {
      action: 'INITIAL_ADMIN_BOOTSTRAP',
      targetType: 'system',
      metadata: { adminEmail: normalizedEmail },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Primary MIHORA administrator configured successfully. You may now sign in.',
    });
  } catch (err: any) {
    console.error('[API] Admin setup error:', err);
    res.status(500).json({ error: 'Failed to configure initial administrator.' });
  }
});

// GET /api/auth/me - Current user identity
authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const userRes = await db.query(
      'SELECT id, email, role, created_at, last_login_at FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: userRes.rows[0] });
  } catch (err: any) {
    console.error('[API] Auth me error:', err);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// POST /api/auth/logout - Clear session
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('mihora_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});
