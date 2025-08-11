import { logAudit as logAuditDb } from './db.js';

export async function logAudit({ actor = 'system', action, boxId = null, parcelId = null, meta = null }) {
  return logAuditDb({ actor, action, boxId, parcelId, meta });
}
