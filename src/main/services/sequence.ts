import { eq, sql } from 'drizzle-orm'
import type { Db } from '../db/client'
import { sequences } from '../db/schema'

const PREFIXES = {
  product: 'IT-',
  sale: 'S-',
  sale_return: 'SR-',
  purchase: 'P-',
  purchase_return: 'PR-',
  quotation: 'Q-',
  receipt: 'RV-',
  payment: 'PV-'
} as const

export type SequenceName = keyof typeof PREFIXES

/** Next document number, e.g. "S-000042". Call inside the transaction that uses it. */
export function nextNumber(db: Db, name: SequenceName): string {
  db.insert(sequences)
    .values({ name, prefix: PREFIXES[name], nextValue: 1 })
    .onConflictDoNothing()
    .run()
  const row = db
    .update(sequences)
    .set({ nextValue: sql`${sequences.nextValue} + 1` })
    .where(eq(sequences.name, name))
    .returning({ prefix: sequences.prefix, value: sql<number>`${sequences.nextValue} - 1` })
    .get()
  return `${row!.prefix}${String(row!.value).padStart(6, '0')}`
}
