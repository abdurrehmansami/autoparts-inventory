// Single source of truth for the database. After editing run `npm run db:generate`.
// Money columns are integer paisa. Quantities are integer units. See docs/DB_SCHEMA.md.
import { sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const id = () => integer('id').primaryKey({ autoIncrement: true })
const createdAt = () => text('created_at').notNull().default(sql`(datetime('now'))`)
const updatedAt = () => text('updated_at').notNull().default(sql`(datetime('now'))`)
const isActive = () => integer('is_active', { mode: 'boolean' }).notNull().default(true)
/** Document lifecycle: posted documents are cancelled, never deleted. */
const status = () => text('status', { enum: ['posted', 'cancelled'] }).notNull().default('posted')

// ─── System ──────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: id(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt()
})

/** Key/value settings; value is JSON text. */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})

/** Document number counters: name = 'sale' | 'purchase' | ... */
export const sequences = sqliteTable('sequences', {
  name: text('name').primaryKey(),
  prefix: text('prefix').notNull(),
  nextValue: integer('next_value').notNull().default(1)
})

export const auditLog = sqliteTable('audit_log', {
  id: id(),
  at: createdAt(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  details: text('details')
})

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const categories = sqliteTable('categories', {
  id: id(),
  nameEn: text('name_en').notNull().unique(),
  nameUr: text('name_ur'),
  createdAt: createdAt()
})

export const brands = sqliteTable('brands', {
  id: id(),
  name: text('name').notNull().unique(),
  createdAt: createdAt()
})

export const vehicles = sqliteTable('vehicles', {
  id: id(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  yearFrom: integer('year_from'),
  yearTo: integer('year_to'),
  engine: text('engine'),
  notes: text('notes'),
  createdAt: createdAt()
})

export const products = sqliteTable(
  'products',
  {
    id: id(),
    code: text('code').notNull().unique(),
    partNumber: text('part_number'),
    oemNumber: text('oem_number'),
    barcode: text('barcode').unique(),
    nameEn: text('name_en').notNull(),
    nameUr: text('name_ur'),
    categoryId: integer('category_id').references(() => categories.id),
    brandId: integer('brand_id').references(() => brands.id),
    unit: text('unit').notNull().default('pcs'),
    location: text('location'),
    /** Last purchase cost (paisa). */
    lastCost: integer('last_cost').notNull().default(0),
    /** Moving average cost (paisa), used for profit and stock valuation. */
    avgCost: integer('avg_cost').notNull().default(0),
    salePrice: integer('sale_price').notNull().default(0),
    minStock: integer('min_stock').notNull().default(0),
    /** Cache of SUM(stock_movements.qty_change). Only services/stock.ts writes it. */
    stockQty: integer('stock_qty').notNull().default(0),
    isActive: isActive(),
    notes: text('notes'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    index('products_part_number_idx').on(t.partNumber),
    index('products_oem_number_idx').on(t.oemNumber),
    index('products_name_en_idx').on(t.nameEn)
  ]
)

/** Alternate part numbers (other brands) for the same item. */
export const productCrossRefs = sqliteTable(
  'product_cross_refs',
  {
    id: id(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    refNumber: text('ref_number').notNull(),
    brand: text('brand')
  },
  (t) => [index('product_cross_refs_ref_idx').on(t.refNumber)]
)

export const productVehicles = sqliteTable(
  'product_vehicles',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    vehicleId: integer('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' })
  },
  (t) => [primaryKey({ columns: [t.productId, t.vehicleId] })]
)

// ─── Parties & accounts ──────────────────────────────────────────────────────

export const parties = sqliteTable(
  'parties',
  {
    id: id(),
    type: text('type', { enum: ['customer', 'supplier', 'both'] }).notNull(),
    name: text('name').notNull(),
    nameUr: text('name_ur'),
    phone: text('phone'),
    address: text('address'),
    city: text('city'),
    creditLimit: integer('credit_limit').notNull().default(0),
    isActive: isActive(),
    notes: text('notes'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('parties_name_idx').on(t.name), index('parties_phone_idx').on(t.phone)]
)

/** Cash in hand and bank accounts. */
export const accounts = sqliteTable('accounts', {
  id: id(),
  type: text('type', { enum: ['cash', 'bank'] }).notNull(),
  name: text('name').notNull().unique(),
  accountNo: text('account_no'),
  isActive: isActive(),
  createdAt: createdAt()
})

// ─── Sales ───────────────────────────────────────────────────────────────────

export const sales = sqliteTable(
  'sales',
  {
    id: id(),
    invoiceNo: text('invoice_no').notNull().unique(),
    date: text('date').notNull(),
    customerId: integer('customer_id').references(() => parties.id),
    /** Free-text name for walk-in customers (customerId null). */
    customerName: text('customer_name'),
    subtotal: integer('subtotal').notNull(),
    discount: integer('discount').notNull().default(0),
    total: integer('total').notNull(),
    paid: integer('paid').notNull().default(0),
    accountId: integer('account_id').references(() => accounts.id),
    quotationId: integer('quotation_id'),
    status: status(),
    cancelReason: text('cancel_reason'),
    notes: text('notes'),
    createdAt: createdAt()
  },
  (t) => [index('sales_date_idx').on(t.date), index('sales_customer_idx').on(t.customerId)]
)

export const saleItems = sqliteTable(
  'sale_items',
  {
    id: id(),
    saleId: integer('sale_id')
      .notNull()
      .references(() => sales.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    qty: integer('qty').notNull(),
    unitPrice: integer('unit_price').notNull(),
    discount: integer('discount').notNull().default(0),
    lineTotal: integer('line_total').notNull(),
    /** Average cost at time of sale (for profit). */
    unitCost: integer('unit_cost').notNull()
  },
  (t) => [index('sale_items_sale_idx').on(t.saleId), index('sale_items_product_idx').on(t.productId)]
)

export const saleReturns = sqliteTable(
  'sale_returns',
  {
    id: id(),
    returnNo: text('return_no').notNull().unique(),
    date: text('date').notNull(),
    saleId: integer('sale_id').references(() => sales.id),
    customerId: integer('customer_id').references(() => parties.id),
    customerName: text('customer_name'),
    total: integer('total').notNull(),
    refunded: integer('refunded').notNull().default(0),
    accountId: integer('account_id').references(() => accounts.id),
    status: status(),
    notes: text('notes'),
    createdAt: createdAt()
  },
  (t) => [index('sale_returns_date_idx').on(t.date)]
)

export const saleReturnItems = sqliteTable('sale_return_items', {
  id: id(),
  returnId: integer('return_id')
    .notNull()
    .references(() => saleReturns.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  qty: integer('qty').notNull(),
  unitPrice: integer('unit_price').notNull(),
  lineTotal: integer('line_total').notNull(),
  unitCost: integer('unit_cost').notNull()
})

// ─── Purchases ───────────────────────────────────────────────────────────────

export const purchases = sqliteTable(
  'purchases',
  {
    id: id(),
    billNo: text('bill_no').notNull().unique(),
    supplierBillNo: text('supplier_bill_no'),
    date: text('date').notNull(),
    supplierId: integer('supplier_id')
      .notNull()
      .references(() => parties.id),
    subtotal: integer('subtotal').notNull(),
    discount: integer('discount').notNull().default(0),
    total: integer('total').notNull(),
    paid: integer('paid').notNull().default(0),
    accountId: integer('account_id').references(() => accounts.id),
    status: status(),
    cancelReason: text('cancel_reason'),
    notes: text('notes'),
    createdAt: createdAt()
  },
  (t) => [index('purchases_date_idx').on(t.date), index('purchases_supplier_idx').on(t.supplierId)]
)

export const purchaseItems = sqliteTable(
  'purchase_items',
  {
    id: id(),
    purchaseId: integer('purchase_id')
      .notNull()
      .references(() => purchases.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    qty: integer('qty').notNull(),
    unitCost: integer('unit_cost').notNull(),
    lineTotal: integer('line_total').notNull()
  },
  (t) => [
    index('purchase_items_purchase_idx').on(t.purchaseId),
    index('purchase_items_product_idx').on(t.productId)
  ]
)

export const purchaseReturns = sqliteTable('purchase_returns', {
  id: id(),
  returnNo: text('return_no').notNull().unique(),
  date: text('date').notNull(),
  purchaseId: integer('purchase_id').references(() => purchases.id),
  supplierId: integer('supplier_id')
    .notNull()
    .references(() => parties.id),
  total: integer('total').notNull(),
  received: integer('received').notNull().default(0),
  accountId: integer('account_id').references(() => accounts.id),
  status: status(),
  notes: text('notes'),
  createdAt: createdAt()
})

export const purchaseReturnItems = sqliteTable('purchase_return_items', {
  id: id(),
  returnId: integer('return_id')
    .notNull()
    .references(() => purchaseReturns.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  qty: integer('qty').notNull(),
  unitCost: integer('unit_cost').notNull(),
  lineTotal: integer('line_total').notNull()
})

// ─── Quotations (post nothing) ───────────────────────────────────────────────

export const quotations = sqliteTable('quotations', {
  id: id(),
  quotationNo: text('quotation_no').notNull().unique(),
  date: text('date').notNull(),
  validUntil: text('valid_until'),
  customerId: integer('customer_id').references(() => parties.id),
  customerName: text('customer_name'),
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').notNull().default(0),
  total: integer('total').notNull(),
  status: text('status', { enum: ['open', 'converted', 'cancelled'] })
    .notNull()
    .default('open'),
  notes: text('notes'),
  createdAt: createdAt()
})

export const quotationItems = sqliteTable('quotation_items', {
  id: id(),
  quotationId: integer('quotation_id')
    .notNull()
    .references(() => quotations.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  qty: integer('qty').notNull(),
  unitPrice: integer('unit_price').notNull(),
  discount: integer('discount').notNull().default(0),
  lineTotal: integer('line_total').notNull()
})

// ─── Ledgers ─────────────────────────────────────────────────────────────────

const refType = () =>
  text('ref_type', {
    enum: [
      'opening',
      'sale',
      'sale_return',
      'purchase',
      'purchase_return',
      'payment',
      'expense',
      'transfer',
      'adjustment'
    ]
  }).notNull()

/** Source of truth for stock. qtyChange is signed (+in / -out). */
export const stockMovements = sqliteTable(
  'stock_movements',
  {
    id: id(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    date: text('date').notNull(),
    qtyChange: integer('qty_change').notNull(),
    unitCost: integer('unit_cost').notNull().default(0),
    refType: refType(),
    refId: integer('ref_id'),
    note: text('note'),
    createdAt: createdAt()
  },
  (t) => [
    index('stock_movements_product_idx').on(t.productId, t.date),
    index('stock_movements_ref_idx').on(t.refType, t.refId)
  ]
)

/** Party (customer/supplier) ledger. debit = party owes us more; credit = owes us less. */
export const ledgerEntries = sqliteTable(
  'ledger_entries',
  {
    id: id(),
    partyId: integer('party_id')
      .notNull()
      .references(() => parties.id),
    date: text('date').notNull(),
    debit: integer('debit').notNull().default(0),
    credit: integer('credit').notNull().default(0),
    refType: refType(),
    refId: integer('ref_id'),
    description: text('description'),
    createdAt: createdAt()
  },
  (t) => [
    index('ledger_entries_party_idx').on(t.partyId, t.date),
    index('ledger_entries_ref_idx').on(t.refType, t.refId)
  ]
)

/** Cash book / bank book rows. */
export const cashEntries = sqliteTable(
  'cash_entries',
  {
    id: id(),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
    date: text('date').notNull(),
    amountIn: integer('amount_in').notNull().default(0),
    amountOut: integer('amount_out').notNull().default(0),
    partyId: integer('party_id').references(() => parties.id),
    refType: refType(),
    refId: integer('ref_id'),
    description: text('description'),
    createdAt: createdAt()
  },
  (t) => [
    index('cash_entries_account_idx').on(t.accountId, t.date),
    index('cash_entries_ref_idx').on(t.refType, t.refId)
  ]
)

/** Receipt (in) from customer / payment (out) to supplier. */
export const payments = sqliteTable(
  'payments',
  {
    id: id(),
    voucherNo: text('voucher_no').notNull().unique(),
    date: text('date').notNull(),
    direction: text('direction', { enum: ['in', 'out'] }).notNull(),
    partyId: integer('party_id')
      .notNull()
      .references(() => parties.id),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
    amount: integer('amount').notNull(),
    status: status(),
    notes: text('notes'),
    createdAt: createdAt()
  },
  (t) => [index('payments_date_idx').on(t.date)]
)

export const expenseCategories = sqliteTable('expense_categories', {
  id: id(),
  nameEn: text('name_en').notNull().unique(),
  nameUr: text('name_ur')
})

export const expenses = sqliteTable(
  'expenses',
  {
    id: id(),
    date: text('date').notNull(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => expenseCategories.id),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id),
    amount: integer('amount').notNull(),
    status: status(),
    notes: text('notes'),
    createdAt: createdAt()
  },
  (t) => [index('expenses_date_idx').on(t.date)]
)
