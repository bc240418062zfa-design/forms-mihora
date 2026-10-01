import { Response } from 'express';

interface AdminClient {
  id: string;
  res: Response;
  adminId: number;
}

const adminClients: Map<string, AdminClient> = new Map();

export function addAdminClient(id: string, res: Response, adminId: number): void {
  adminClients.set(id, { id, res, adminId });
  console.log(`[Realtime] Admin client ${id} connected. Total active clients: ${adminClients.size}`);
}

export function removeAdminClient(id: string): void {
  adminClients.delete(id);
  console.log(`[Realtime] Admin client ${id} disconnected. Total active clients: ${adminClients.size}`);
}

export interface CandidateUpdateEvent {
  type: 'CANDIDATE_REGISTERED' | 'PROFILE_UPDATED';
  candidateId: number;
  referenceCode: string;
  name: string;
  primaryRole: string;
  completionPercentage: number;
  timestamp: string;
}

export function broadcastAdminEvent(event: CandidateUpdateEvent): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  console.log(`[Realtime] Broadcasting event to ${adminClients.size} admin clients:`, event.type);
  
  for (const [clientId, client] of adminClients.entries()) {
    try {
      client.res.write(payload);
    } catch (err) {
      console.error(`[Realtime] Failed writing to client ${clientId}:`, err);
      adminClients.delete(clientId);
    }
  }
}

// Keep connection open with regular heartbeat pings
setInterval(() => {
  for (const [clientId, client] of adminClients.entries()) {
    try {
      client.res.write(': heartbeat\n\n');
    } catch {
      adminClients.delete(clientId);
    }
  }
}, 15000);
