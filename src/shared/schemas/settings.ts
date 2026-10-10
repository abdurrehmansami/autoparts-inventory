import { z } from 'zod'

export const languageSchema = z.enum(['en', 'ur'])
export type Language = z.infer<typeof languageSchema>

export const paperSizeSchema = z.enum(['A4', 'A5', '80mm', '58mm'])
export type PaperSize = z.infer<typeof paperSizeSchema>

// Field schemas carry NO defaults: with zod 4, `.partial()` would still fill defaults in and a
// patch like { language } would overwrite every other setting.
export const settingsFields = {
  language: languageSchema,
  shopName: z.string().max(100),
  shopNameUr: z.string().max(100),
  shopAddress: z.string().max(300),
  shopPhone: z.string().max(100),
  invoiceFooter: z.string().max(500),
  invoicePaper: paperSizeSchema,
  invoicePrinter: z.string().max(200),
  printSilently: z.boolean(),
  /** What happens when a sale exceeds available stock. */
  negativeStock: z.enum(['allow', 'warn', 'block']),
  backupFolder: z.string().max(1000)
}

export const appSettingsSchema = z.object(settingsFields)
export type AppSettings = z.infer<typeof appSettingsSchema>

export const defaultSettings: AppSettings = {
  language: 'en',
  shopName: '',
  shopNameUr: '',
  shopAddress: '',
  shopPhone: '',
  invoiceFooter: '',
  invoicePaper: '80mm',
  invoicePrinter: '',
  printSilently: false,
  negativeStock: 'warn',
  backupFolder: ''
}

export const settingsPatchSchema = appSettingsSchema.partial().strict()
export type SettingsPatch = z.infer<typeof settingsPatchSchema>
