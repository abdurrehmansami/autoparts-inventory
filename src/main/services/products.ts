import { and, asc, count, eq, like, lte, or, sql, type SQL } from 'drizzle-orm'
import { AppError } from '@shared/errors'
import type { Paged } from '@shared/ipc-contract'
import {
  productInputSchema,
  productListSchema,
  type ProductInput,
  type ProductListInput,
  type ProductRow
} from '@shared/schemas/products'
import type { Db } from '../db/client'
import { brands, categories, productCrossRefs, products } from '../db/schema'
import { audit } from './audit'
import { nextNumber } from './sequence'

const rowColumns = {
  id: products.id,
  code: products.code,
  partNumber: products.partNumber,
  oemNumber: products.oemNumber,
  barcode: products.barcode,
  nameEn: products.nameEn,
  nameUr: products.nameUr,
  categoryId: products.categoryId,
  categoryName: categories.nameEn,
  brandId: products.brandId,
  brandName: brands.name,
  unit: products.unit,
  location: products.location,
  lastCost: products.lastCost,
  avgCost: products.avgCost,
  salePrice: products.salePrice,
  minStock: products.minStock,
  stockQty: products.stockQty,
  isActive: products.isActive,
  notes: products.notes
}

function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`)
}

function contains(column: Parameters<typeof like>[0], term: string): SQL {
  return sql`${column} LIKE ${`%${escapeLike(term)}%`} ESCAPE '\\'`
}

/** Search matches every word against code, part/OEM numbers, barcode, names and cross-references. */
function searchCondition(search: string): SQL | undefined {
  const words = search.split(/\s+/).filter(Boolean)
  if (words.length === 0) return undefined
  return and(
    ...words.map(
      (w) =>
        or(
          contains(products.code, w),
          contains(products.partNumber, w),
          contains(products.oemNumber, w),
          contains(products.barcode, w),
          contains(products.nameEn, w),
          contains(products.nameUr, w),
          contains(brands.name, w),
          sql`EXISTS (SELECT 1 FROM ${productCrossRefs} WHERE ${productCrossRefs.productId} = ${products.id}
                AND ${contains(productCrossRefs.refNumber, w)})`
        )!
    )
  )
}

export function listProducts(db: Db, rawInput: ProductListInput): Paged<ProductRow> {
  const input = productListSchema.parse(rawInput)
  const where = and(
    input.includeInactive ? undefined : eq(products.isActive, true),
    input.lowStockOnly ? lte(products.stockQty, products.minStock) : undefined,
    searchCondition(input.search)
  )
  const base = () =>
    db
      .select(rowColumns)
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(where)
  const rows = base().orderBy(asc(products.nameEn)).limit(input.limit).offset(input.offset).all()
  const total = db
    .select({ n: count() })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(where)
    .get()!.n
  return { rows, total }
}

export function getProduct(db: Db, id: number): ProductRow {
  const row = db
    .select(rowColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(eq(products.id, id))
    .get()
  if (!row) throw new AppError('errors.notFound')
  return row
}

function assertUnique(db: Db, field: 'code' | 'barcode', value: string | null, exceptId?: number): void {
  if (!value) return
  const column = products[field]
  const clash = db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(column, value), exceptId ? sql`${products.id} <> ${exceptId}` : undefined))
    .get()
  if (clash) throw new AppError('errors.duplicate', { field })
}

export function createProduct(db: Db, rawInput: ProductInput): ProductRow {
  const input = productInputSchema.parse(rawInput)
  const id = db.transaction((tx) => {
    const code = input.code ?? nextNumber(tx, 'product')
    assertUnique(tx, 'code', code)
    assertUnique(tx, 'barcode', input.barcode)
    const { id } = tx
      .insert(products)
      .values({ ...input, code, avgCost: input.lastCost })
      .returning({ id: products.id })
      .get()
    audit(tx, 'create', 'products', id)
    return id
  })
  return getProduct(db, id)
}

export function updateProduct(db: Db, id: number, rawInput: ProductInput): ProductRow {
  const input = productInputSchema.parse(rawInput)
  db.transaction((tx) => {
    const existing = tx.select({ code: products.code }).from(products).where(eq(products.id, id)).get()
    if (!existing) throw new AppError('errors.notFound')
    const code = input.code ?? existing.code
    assertUnique(tx, 'code', code, id)
    assertUnique(tx, 'barcode', input.barcode, id)
    // Stock and average cost are never edited here — only via stock movements / purchases.
    tx.update(products)
      .set({ ...input, code, updatedAt: sql`(datetime('now'))` })
      .where(eq(products.id, id))
      .run()
    audit(tx, 'update', 'products', id)
  })
  return getProduct(db, id)
}
