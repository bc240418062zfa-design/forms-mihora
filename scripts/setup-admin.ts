import readline from 'readline';
import { getDb } from '../server/db/index.js';
import { runMigrations } from '../server/db/migrations.js';
import { hashPassword } from '../server/auth.js';
import { logAuditEvent } from '../server/utils/audit.js';

async function main() {
  console.log('========================================================');
  console.log('  MIHORA TECH — SECURE ADMINISTRATOR BOOTSTRAP CLI');
  console.log('========================================================\n');

  const args = process.argv.slice(2);
  let emailArg = args.find((a) => a.startsWith('--email='))?.split('=')[1]?.trim();
  let passwordArg = args.find((a) => a.startsWith('--password='))?.split('=')[1];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> =>
    new Promise((resolve) => rl.question(query, resolve));

  try {
    if (!emailArg) {
      emailArg = await question('Enter Primary Administrator Email: ');
    }
    if (!passwordArg) {
      passwordArg = await question('Enter Secure Administrator Password (min 10 chars): ');
    }

    rl.close();

    const normalizedEmail = (emailArg || '').trim().toLowerCase();
    const password = passwordArg || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      console.error('[ERROR] Invalid email address format.');
      process.exit(1);
    }

    if (password.length < 10) {
      console.error('[ERROR] Password must be at least 10 characters in length.');
      process.exit(1);
    }

    console.log('\n[1/3] Connecting to PostgreSQL database...');
    const db = await getDb();
    await runMigrations(db);

    console.log('[2/3] Hashing credentials with bcrypt (12 salt rounds)...');
    const pwdHash = await hashPassword(password);

    console.log('[3/3] Committing administrative user to database...');
    const existing = await db.query('SELECT id, role FROM users WHERE email = $1', [normalizedEmail]);

    if (existing.rows.length > 0) {
      await db.query(
        "UPDATE users SET password_hash = $1, role = 'SUPER_ADMIN', is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [pwdHash, existing.rows[0].id]
      );
      console.log(`[SUCCESS] Existing user (${normalizedEmail}) upgraded to SUPER_ADMIN.`);
    } else {
      await db.query(
        "INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, 'SUPER_ADMIN', true)",
        [normalizedEmail, pwdHash]
      );
      console.log(`[SUCCESS] Primary SUPER_ADMIN account created for (${normalizedEmail}).`);
    }

    await logAuditEvent(db, {
      action: 'ADMIN_CLI_BOOTSTRAP',
      targetType: 'user',
      metadata: { adminEmail: normalizedEmail },
    });

    await db.close();
    console.log('\nAdministrative provisioning complete.');
    console.log(`Sign in at: https://careers.mihora.tech/admin/login`);
    process.exit(0);
  } catch (err: any) {
    rl.close();
    console.error('[FATAL] Failed to configure administrator:', err.message || err);
    process.exit(1);
  }
}

main();
