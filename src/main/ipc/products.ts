import { z } from 'zod'
import { productInputSchema, productListSchema } from '@shared/schemas/products'
import { createBrand, createCategory, listBrands, listCategories } from '../services/lookups'
import { createProduct, getProduct, listProducts, updateProduct } from '../services/products'
import type { Handle } from './registry'

const idSchema = z.object({ id: z.number().int().positive() })
const nameSchema = z.object({ name: z.string().trim().min(1).max(100) })

export function registerProducts(handle: Handle): void {
  handle('products:list', productListSchema, (input, { db }) => listProducts(db, input))
  handle('products:get', idSchema, ({ id }, { db }) => getProduct(db, id))
  handle('products:create', productInputSchema, (input, { db }) => createProduct(db, input))
  handle('products:update', z.object({ id: z.number().int().positive(), data: productInputSchema }), ({ id, data }, { db }) =>
    updateProduct(db, id, data)
  )

  handle('lookups:categories', null, (_, { db }) => listCategories(db))
  handle('lookups:brands', null, (_, { db }) => listBrands(db))
  handle('lookups:createCategory', nameSchema, ({ name }, { db }) => createCategory(db, name))
  handle('lookups:createBrand', nameSchema, ({ name }, { db }) => createBrand(db, name))
}
