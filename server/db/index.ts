import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  exec(sql: string): Promise<void>;
  transaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  isPgPool(): boolean;
}

let dbInstance: DbClient | null = null;

export async function getDb(): Promise<DbClient> {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  // Strict Fail-Fast Check: Production must use real PostgreSQL via DATABASE_URL
  if (isProduction && (!databaseUrl || databaseUrl.trim() === '')) {
    const errorMsg =
      '[FATAL] Production database configuration error: DATABASE_URL is missing. ' +
      'Heroku Postgres injects DATABASE_URL automatically. Embedded/local database fallback is strictly prohibited in production.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (databaseUrl && databaseUrl.trim() !== '') {
    console.log('[DB] Connecting to PostgreSQL pool via DATABASE_URL...');
    const isRemote = !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1');

    const pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle PostgreSQL client:', err);
    });

    // Test connection
    const client = await pool.connect();
    client.release();
    console.log('[DB] PostgreSQL pool successfully connected and verified.');

    dbInstance = {
      async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
        const res = await pool.query(sql, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount ?? res.rows.length,
        };
      },
      async exec(sql: string): Promise<void> {
        await pool.query(sql);
      },
      async transaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
        const pgClient = await pool.connect();
        try {
          await pgClient.query('BEGIN');
          const txClient: DbClient = {
            async query<R = any>(sql: string, params: any[] = []): Promise<QueryResult<R>> {
              const res = await pgClient.query(sql, params);
              return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
            },
            async exec(sql: string): Promise<void> {
              await pgClient.query(sql);
            },
            async transaction() {
              throw new Error('Nested transactions not supported');
            },
            async close() {},
            isPgPool: () => true,
          };
          const result = await callback(txClient);
          await pgClient.query('COMMIT');
          return result;
        } catch (err) {
          await pgClient.query('ROLLBACK');
          throw err;
        } finally {
          pgClient.release();
        }
      },
      async close(): Promise<void> {
        await pool.end();
        dbInstance = null;
      },
      isPgPool: () => true,
    };
  } else {
    console.log('[DB] DATABASE_URL not set. Initializing embedded PostgreSQL engine (PGlite) with file persistence...');
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'mihora_pg.db');
    const pglite = new PGlite(dbPath);
    await pglite.waitReady;
    console.log(`[DB] Embedded PostgreSQL ready at ${dbPath}`);

    dbInstance = {
      async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
        const res = await pglite.query(sql, params);
        return {
          rows: (res.rows as T[]) || [],
          rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0),
        };
      },
      async exec(sql: string): Promise<void> {
        await pglite.exec(sql);
      },
      async transaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
        return await pglite.transaction(async (tx) => {
          const txClient: DbClient = {
            async query<R = any>(sql: string, params: any[] = []): Promise<QueryResult<R>> {
              const res = await tx.query(sql, params);
              return {
                rows: (res.rows as R[]) || [],
                rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0),
              };
            },
            async exec(sql: string): Promise<void> {
              await tx.exec(sql);
            },
            async transaction() {
              throw new Error('Nested transactions not supported');
            },
            async close() {},
            isPgPool: () => false,
          };
          return await callback(txClient);
        });
      },
      async close(): Promise<void> {
        await pglite.close();
        dbInstance = null;
      },
      isPgPool: () => false,
    };
  }

  return dbInstance;
}
