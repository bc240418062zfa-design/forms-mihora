import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.trim() === '' || secret.includes('change-in-')) {
      const msg =
        '[FATAL] Production SESSION_SECRET must be externally supplied through Heroku Config Vars. ' +
        'Development placeholder secrets are strictly prohibited in production.';
      console.error(msg);
      throw new Error(msg);
    }
    return secret;
  }
  return secret || 'mihora-dev-fallback-secret-key-local-only';
}

const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  userId: number;
  email: string;
  role: 'CANDIDATE' | 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    if (decoded && decoded.userId && decoded.email && decoded.role) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.mihora_token) {
    token = req.cookies.mihora_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.user = user;
  next();
}

export function requireCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'CANDIDATE') {
    return res.status(403).json({ error: 'Access restricted to candidates.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'VIEWER'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access restricted to authorized MIHORA administrators.' });
  }
  next();
}

export function requireAdminWrite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Read-only viewer account cannot modify administrative records.' });
  }
  next();
}
