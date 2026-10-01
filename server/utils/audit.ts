import { DbClient } from '../db/index.js';

export function formatReferenceCode(id: number): string {
  return `MIH-CND-${String(id).padStart(6, '0')}`;
}

export async function logAuditEvent(
  db: DbClient,
  params: {
    actorId?: number | null;
    actorEmail?: string | null;
    actorRole?: string | null;
    action: string;
    targetType?: string | null;
    targetId?: string | null;
    metadata?: any;
    ipAddress?: string | null;
  }
): Promise<void> {
  try {
    const metaString = params.metadata ? JSON.stringify(params.metadata) : null;
    await db.query(
      `INSERT INTO audit_logs (actor_id, actor_email, actor_role, action, target_type, target_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        params.actorId || null,
        params.actorEmail || null,
        params.actorRole || null,
        params.action,
        params.targetType || null,
        params.targetId || null,
        metaString,
        params.ipAddress || null,
      ]
    );
  } catch (err) {
    console.error('[AUDIT] Failed to record audit log:', err);
  }
}
