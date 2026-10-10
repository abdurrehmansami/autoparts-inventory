import { eq, sql } from 'drizzle-orm'
import type { Db } from '../db/client'
import { products, stockMovements } from '../db/schema'

export type MovementRef = typeof stockMovements.$inferInsert['refType']

export interface MovementInput {
  productId: number
  date: string
  /** Signed: + stock in, − stock out. */
  qtyChange: number
  unitCost?: number
  refType: MovementRef
  refId?: number | null
  note?: string | null
}

/**
 * The ONLY way stock changes. Writes the movement and updates the cached products.stock_qty.
 * Must be called inside the caller's transaction when part of a document.
 */
export function recordMovement(db: Db, input: MovementInput): void {
  if (!Number.isInteger(input.qtyChange) || input.qtyChange === 0) {
    throw new Error(`Invalid qtyChange ${input.qtyChange}`)
  }
  db.insert(stockMovements)
    .values({
      productId: input.productId,
      date: input.date,
      qtyChange: input.qtyChange,
      unitCost: input.unitCost ?? 0,
      refType: input.refType,
      refId: input.refId ?? null,
      note: input.note ?? null
    })
    .run()
  db.update(products)
    .set({ stockQty: sql`${products.stockQty} + ${input.qtyChange}` })
    .where(eq(products.id, input.productId))
    .run()
}

/** Rebuilds products.stock_qty from the movement ledger. Returns how many products were corrected. */
export function recalculateStock(db: Db): number {
  const result = db.run(sql`
    UPDATE products SET stock_qty = COALESCE(
      (SELECT SUM(qty_change) FROM stock_movements m WHERE m.product_id = products.id), 0)
    WHERE stock_qty <> COALESCE(
      (SELECT SUM(qty_change) FROM stock_movements m WHERE m.product_id = products.id), 0)`)
  return result.changes
}

/** Moving average cost after receiving `qty` at `unitCost` (all paisa, rounded). */
export function nextAverageCost(currentQty: number, currentAvg: number, qty: number, unitCost: number): number {
  const base = Math.max(currentQty, 0)
  if (base + qty <= 0) return unitCost
  return Math.round((base * currentAvg + qty * unitCost) / (base + qty))
}
