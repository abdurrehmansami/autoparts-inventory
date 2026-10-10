import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .default(null)

const paisa = z.number().int().min(0)

export const productInputSchema = z.object({
  /** Leave empty to auto-generate (IT-000001). */
  code: optionalText(30),
  partNumber: optionalText(60),
  oemNumber: optionalText(60),
  barcode: optionalText(60),
  nameEn: z.string().trim().min(1).max(150),
  nameUr: optionalText(150),
  categoryId: z.number().int().positive().nullable().default(null),
  brandId: z.number().int().positive().nullable().default(null),
  unit: z.string().trim().min(1).max(20).default('pcs'),
  location: optionalText(40),
  salePrice: paisa.default(0),
  lastCost: paisa.default(0),
  minStock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  notes: optionalText(500)
})
export type ProductInput = z.input<typeof productInputSchema>

export const productUpdateSchema = z.object({
  id: z.number().int().positive(),
  data: productInputSchema
})

export const productListSchema = z.object({
  search: z.string().trim().max(100).default(''),
  includeInactive: z.boolean().default(false),
  lowStockOnly: z.boolean().default(false),
  limit: z.number().int().min(1).max(500).default(200),
  offset: z.number().int().min(0).default(0)
})
export type ProductListInput = z.input<typeof productListSchema>

export interface ProductRow {
  id: number
  code: string
  partNumber: string | null
  oemNumber: string | null
  barcode: string | null
  nameEn: string
  nameUr: string | null
  categoryId: number | null
  categoryName: string | null
  brandId: number | null
  brandName: string | null
  unit: string
  location: string | null
  lastCost: number
  avgCost: number
  salePrice: number
  minStock: number
  stockQty: number
  isActive: boolean
  notes: string | null
}

export interface LookupItem {
  id: number
  name: string
}
