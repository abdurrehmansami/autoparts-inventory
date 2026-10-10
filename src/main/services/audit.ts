import type { Db } from '../db/client'
import { auditLog } from '../db/schema'

export function audit(db: Db, action: string, entity: string, entityId?: number, details?: unknown): void {
  db.insert(auditLog)
    .values({ action, entity, entityId, details: details === undefined ? null : JSON.stringify(details) })
    .run()
}
