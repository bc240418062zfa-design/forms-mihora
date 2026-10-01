import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { getDb } from './server/db/index.js';
import { runMigrations } from './server/db/migrations.js';
import { authRouter } from './server/routes/auth.js';
import { candidateRouter } from './server/routes/candidate.js';
import { adminRouter } from './server/routes/admin.js';
import { addAdminClient, removeAdminClient } from './server/realtime.js';
import { verifyToken } from './server/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Listening port: Uses process.env.PORT automatically provided by Heroku, with fallback to 3000 for local dev
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Production Readiness Environment Audit
function validateProductionEnvironment(): void {
  if (isProd) {
    console.log('[AUDIT] Running production readiness checks...');

    // 1. PostgreSQL Database
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
      console.error(
        '[FATAL CONFIG] DATABASE_URL is missing. Heroku Postgres injects DATABASE_URL automatically. ' +
        'Embedded/local fallback is strictly forbidden in production.'
      );
      process.exit(1);
    }

    // 2. Cryptographic Secret
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || sessionSecret.trim() === '' || sessionSecret.includes('change-in-')) {
      console.error(
        '[FATAL CONFIG] Secure SESSION_SECRET must be supplied via Heroku Config Vars. ' +
        'Development placeholder secrets are strictly forbidden in production.'
      );
      process.exit(1);
    }

    console.log('[AUDIT] All production environment validations passed.');
  }
}

validateProductionEnvironment();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite inline scripts and Google Fonts
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Trust proxy for Heroku dyno load balancers
app.set('trust proxy', 1);

// Static assets for branding (logos, public images)
const publicDir = path.resolve(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Health Check Endpoint - Verifies PostgreSQL connectivity without leaking secrets
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const dbCheck = await db.query('SELECT 1 as alive');
    const isAlive = dbCheck.rows.length > 0 && dbCheck.rows[0].alive === 1;

    res.status(isAlive ? 200 : 503).json({
      status: isAlive ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: isAlive,
        engine: db.isPgPool() ? 'PostgreSQL' : 'PGlite',
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err: any) {
    console.error('[HEALTH] Database health check check failed');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connectivity check failed.',
    });
  }
});

// Real-Time Admin SSE Stream
app.get('/api/realtime/admin-stream', (req: Request, res: Response) => {
  const token = (req.query.token as string) || req.cookies?.mihora_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required for real-time events.' });
  }

  const user = verifyToken(token);
  if (!user || !['SUPER_ADMIN', 'ADMIN', 'VIEWER'].includes(user.role)) {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = `admin_${user.userId}_${Date.now()}`;
  addAdminClient(clientId, res, user.userId);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    removeAdminClient(clientId);
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/candidate', candidateRouter);
app.use('/api/admin', adminRouter);

// Sanitized Global Error Handler - Never leaks credentials, stack traces, or server paths
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UNHANDLED ERROR]', err?.message || err);
  if (res.headersSent) {
    return;
  }
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  res.status(statusCode).json({
    error: isProd
      ? 'An unexpected error occurred. Please try again or contact support.'
      : err?.message || 'Internal Server Error',
  });
});

// Frontend Vite Integration (Dev) or Static Build (Prod)
async function startServer() {
  try {
    // 1. Initialize DB and run migrations against PostgreSQL
    const db = await getDb();
    await runMigrations(db);

    // 2. Setup Vite in dev or serve dist in production
    if (!isProd) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[SERVER] Vite development middleware mounted.');
    } else {
      const distDir = path.resolve(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        app.use(express.static(distDir));
        app.get('*', (_req, res) => {
          res.sendFile(path.join(distDir, 'index.html'));
        });
      }
      console.log('[SERVER] Serving production frontend build.');
    }

    // 3. Start listening on process.env.PORT
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] MIHORA Tech Candidate Portal running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err: any) {
    console.error('[FATAL] Failed to start server:', err?.message || err);
    process.exit(1);
  }
}

// Graceful Shutdown for Heroku Dyno lifecycle (SIGTERM/SIGINT)
const handleShutdown = async (signal: string) => {
  console.log(`[SERVER] Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    try {
      const db = await getDb();
      await db.close();
      console.log('[SERVER] Database connection pool closed safely.');
      process.exit(0);
    } catch (err) {
      console.error('[SERVER] Error during DB disconnection:', err);
      process.exit(1);
    }
  });

  // Force termination if dyno does not close within 10s
  setTimeout(() => {
    console.error('[SERVER] Force shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
