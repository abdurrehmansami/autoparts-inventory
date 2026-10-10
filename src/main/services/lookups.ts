import { asc, eq } from 'drizzle-orm'
import { AppError } from '@shared/errors'
import type { LookupItem } from '@shared/schemas/products'
import type { Db } from '../db/client'
import { brands, categories } from '../db/schema'

export function listCategories(db: Db): LookupItem[] {
  return db
    .select({ id: categories.id, name: categories.nameEn })
    .from(categories)
    .orderBy(asc(categories.nameEn))
    .all()
}

export function listBrands(db: Db): LookupItem[] {
  return db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)).all()
}

export function createCategory(db: Db, name: string): LookupItem {
  if (db.select().from(categories).where(eq(categories.nameEn, name)).get()) {
    throw new AppError('errors.duplicate', { field: 'name' })
  }
  return db
    .insert(categories)
    .values({ nameEn: name })
    .returning({ id: categories.id, name: categories.nameEn })
    .get()
}

export function createBrand(db: Db, name: string): LookupItem {
  if (db.select().from(brands).where(eq(brands.name, name)).get()) {
    throw new AppError('errors.duplicate', { field: 'name' })
  }
  return db.insert(brands).values({ name }).returning({ id: brands.id, name: brands.name }).get()
}
