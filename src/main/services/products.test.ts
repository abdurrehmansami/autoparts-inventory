import { beforeEach, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { AppError } from '@shared/errors'
import type { Db } from '../db/client'
import { createTestDb } from '../db/test-db'
import { createBrand } from './lookups'
import { createProduct, getProduct, listProducts, updateProduct } from './products'
import { nextAverageCost, recalculateStock, recordMovement } from './stock'

let db: Db

beforeEach(() => {
  db = createTestDb().db
})

describe('products', () => {
  it('auto-generates codes and lists with brand names', () => {
    const brand = createBrand(db, 'Denso')
    const a = createProduct(db, { nameEn: 'Spark Plug', partNumber: 'K16TT', brandId: brand.id, salePrice: 45000 })
    const b = createProduct(db, { nameEn: 'Air Filter', nameUr: 'ایئر فلٹر' })
    expect(a.code).toBe('IT-000001')
    expect(b.code).toBe('IT-000002')
    expect(a.brandName).toBe('Denso')
    expect(listProducts(db, {}).rows.map((r) => r.nameEn)).toEqual(['Air Filter', 'Spark Plug'])
  })

  it('searches by part number, Urdu name, brand and multiple words', () => {
    const brand = createBrand(db, 'Denso')
    createProduct(db, { nameEn: 'Spark Plug Corolla', partNumber: 'K16TT', brandId: brand.id })
    createProduct(db, { nameEn: 'Air Filter Mehran', nameUr: 'ایئر فلٹر' })
    expect(listProducts(db, { search: 'k16' }).total).toBe(1)
    expect(listProducts(db, { search: 'فلٹر' }).rows[0].nameEn).toBe('Air Filter Mehran')
    expect(listProducts(db, { search: 'denso corolla' }).total).toBe(1)
    expect(listProducts(db, { search: 'denso mehran' }).total).toBe(0)
    expect(listProducts(db, { search: '100%' }).total).toBe(0)
  })

  it('rejects duplicate codes and barcodes', () => {
    createProduct(db, { nameEn: 'A', code: 'X1', barcode: '123' })
    expect(() => createProduct(db, { nameEn: 'B', code: 'X1' })).toThrow(AppError)
    expect(() => createProduct(db, { nameEn: 'B', barcode: '123' })).toThrow(AppError)
  })

  it('updates fields but never stock', () => {
    const p = createProduct(db, { nameEn: 'Brake Pad' })
    recordMovement(db, { productId: p.id, date: '2026-10-04', qtyChange: 10, refType: 'opening' })
    const updated = updateProduct(db, p.id, { nameEn: 'Brake Pad Front', code: p.code })
    expect(updated.nameEn).toBe('Brake Pad Front')
    expect(updated.stockQty).toBe(10)
  })
})

describe('stock', () => {
  it('keeps stock_qty in sync with movements and can rebuild it', () => {
    const p = createProduct(db, { nameEn: 'Oil Filter' })
    recordMovement(db, { productId: p.id, date: '2026-10-04', qtyChange: 12, refType: 'purchase' })
    recordMovement(db, { productId: p.id, date: '2026-10-04', qtyChange: -5, refType: 'sale' })
    expect(getProduct(db, p.id).stockQty).toBe(7)
    expect(recalculateStock(db)).toBe(0)
    db.run(sql`UPDATE products SET stock_qty = 99`) // simulate a corrupted cache
    expect(recalculateStock(db)).toBe(1)
    expect(getProduct(db, p.id).stockQty).toBe(7)
  })

  it('rolls back everything when a transaction fails', () => {
    const p = createProduct(db, { nameEn: 'Clutch Plate' })
    expect(() =>
      db.transaction((tx) => {
        recordMovement(tx, { productId: p.id, date: '2026-10-04', qtyChange: 3, refType: 'purchase' })
        throw new Error('boom')
      })
    ).toThrow('boom')
    expect(getProduct(db, p.id).stockQty).toBe(0)
  })

  it('computes moving average cost', () => {
    expect(nextAverageCost(0, 0, 10, 1000)).toBe(1000)
    expect(nextAverageCost(10, 1000, 10, 2000)).toBe(1500)
    expect(nextAverageCost(-2, 1000, 3, 3000)).toBe(3000)
  })
})
