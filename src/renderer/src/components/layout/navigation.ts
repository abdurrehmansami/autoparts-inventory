import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  BookOpen,
  Car,
  ClipboardList,
  DatabaseBackup,
  FileInput,
  FileText,
  Home,
  Info,
  Landmark,
  Receipt,
  Scale,
  Search,
  Settings,
  ShoppingCart,
  Tags,
  TrendingUp,
  TriangleAlert,
  Truck,
  Undo2,
  Users,
  Wallet,
  type LucideIcon
} from 'lucide-react'

export interface NavItem {
  /** i18n key under menu.* */
  key: string
  path: string
  icon: LucideIcon
  shortcut?: string
}

export interface NavMenu {
  key: string
  items: Array<NavItem | 'separator'>
}

const item = (key: string, path: string, icon: LucideIcon, shortcut?: string): NavItem => ({ key, path, icon, shortcut })

export const nav = {
  home: item('home', '/', Home),
  stock: item('stock', '/products', Boxes),
  find: item('find', '/products?focus=search', Search, 'F3'),
  lowStock: item('lowStock', '/products?low=1', TriangleAlert),
  stockAdjustment: item('stockAdjustment', '/stock/adjustment', Scale),
  categoriesBrands: item('categoriesBrands', '/catalog', Tags),
  vehicles: item('vehicles', '/vehicles', Car),
  saleEntry: item('saleEntry', '/sales/new', ShoppingCart, 'F2'),
  saleReturn: item('saleReturn', '/sales/return', Undo2),
  saleReports: item('saleReports', '/reports/sales', BarChart3),
  quotation: item('quotation', '/quotations', FileText),
  purchaseEntry: item('purchaseEntry', '/purchases/new', ClipboardList, 'F4'),
  purchaseReturn: item('purchaseReturn', '/purchases/return', Undo2),
  purchaseReports: item('purchaseReports', '/reports/purchases', BarChart3),
  customers: item('customers', '/parties/customers', Users),
  suppliers: item('suppliers', '/parties/suppliers', Truck),
  cashBook: item('cashBook', '/accounts/cash-book', Wallet),
  bankBook: item('bankBook', '/accounts/bank-book', Landmark),
  ledger: item('ledger', '/accounts/ledger', BookOpen),
  payments: item('payments', '/accounts/payments', Receipt),
  expenses: item('expenses', '/accounts/expenses', Receipt),
  rateComparison: item('rateComparison', '/reports/rate-comparison', ArrowLeftRight),
  stockReport: item('stockReport', '/reports/stock', Boxes),
  profitReport: item('profitReport', '/reports/profit', TrendingUp),
  dayClose: item('dayClose', '/reports/day-close', BookOpen),
  backup: item('backup', '/tools/backup', DatabaseBackup),
  import: item('import', '/tools/import', FileInput),
  settings: item('settings', '/settings', Settings),
  about: item('about', '/about', Info)
} satisfies Record<string, NavItem>

/** Menu bar — mirrors the old Express Inventory menus so staff find things where they expect. */
export const menus: NavMenu[] = [
  { key: 'products', items: [nav.stock, nav.find, nav.lowStock, 'separator', nav.stockAdjustment, nav.categoriesBrands, nav.vehicles] },
  { key: 'sales', items: [nav.saleEntry, nav.saleReturn, nav.quotation, 'separator', nav.saleReports, nav.customers] },
  { key: 'purchase', items: [nav.purchaseEntry, nav.purchaseReturn, 'separator', nav.purchaseReports, nav.suppliers] },
  { key: 'accounts', items: [nav.cashBook, nav.bankBook, nav.ledger, 'separator', nav.payments, nav.expenses] },
  { key: 'reports', items: [nav.saleReports, nav.purchaseReports, nav.stockReport, nav.profitReport, nav.rateComparison, nav.dayClose] },
  { key: 'tools', items: [nav.backup, nav.import, 'separator', nav.settings] },
  { key: 'help', items: [nav.about] }
]

/** Toolbar — same order as the old app's toolbar. */
export const toolbar: Array<NavItem | 'separator'> = [
  nav.stock,
  nav.find,
  'separator',
  nav.saleEntry,
  nav.saleReports,
  'separator',
  nav.purchaseEntry,
  nav.purchaseReports,
  'separator',
  nav.suppliers,
  nav.customers,
  'separator',
  nav.quotation,
  'separator',
  nav.cashBook,
  nav.bankBook,
  nav.ledger,
  nav.rateComparison
]

export const allNavItems: NavItem[] = Object.values(nav)
