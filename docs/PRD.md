# Product Requirements — AutoParts Inventory

## 1. Context
A retail/wholesale auto parts shop in Karachi currently uses "Express Inventory" (Microcraft, 2012),
a Windows desktop app. Only a screenshot of its main screen is available. Its menu and toolbar show
what the shop relies on, and this app must cover all of it:

| Old toolbar | New module |
|---|---|
| Stock, Find | Products & Stock, global product search |
| Sale Entry, Sale Reports, Preview | Sales (invoice entry, print/preview, reports) |
| Purchase Entry, Purchase Reports | Purchases |
| Customers, Suppliers | Parties |
| Quotation | Quotations |
| Cash Book, Bank Book, Ledger | Accounts |
| Rate Comp. | Rate comparison (supplier prices per part) |

## 2. Constraints
- Desktop app, **fully offline**, one PC (Windows 10/11). Dev on Ubuntu; same build runs on both.
- **Zero running cost**: open-source stack, local SQLite file, no servers, no paid services.
- **Two languages** across the whole UI: English and Urdu (RTL), switchable at any time.
- **Single login** (one username/password). No roles.
- Printing to **both** A4/A5 laser printers and 80 mm / 58 mm thermal receipt printers.
- No FBR/tax integration for now (keep invoice totals design open to a tax line later).
- Future: import data from the old system (likely an MS Access `.mdb`) — via CSV/Excel importer.

## 3. Users
Shop owner and counter staff sharing one login. Fast typists, keyboard-first, may be more
comfortable in Urdu. Low tolerance for slow screens.

## 4. Functional requirements

### 4.1 Products & stock
- Fields: internal code (unique, auto), part number, OEM number, barcode, name (EN), name (UR),
  category, brand, unit (pcs, set, pair, ltr, ft…), rack/shelf location, purchase cost,
  average cost (auto), sale price, minimum stock, active flag, notes.
- Cross-reference numbers (alternate brand part numbers for the same item).
- Vehicle fitment: make, model, year range, engine (e.g. Suzuki Mehran 2012–2019 800cc).
- Opening stock entry; stock adjustment (damage, count correction) with reason.
- Find: search by code, part no, OEM no, cross-ref, barcode, name (EN/UR), vehicle. Results < 200 ms
  on 50k products.
- Low-stock list (stock ≤ minimum). Stock valuation (qty × average cost).
- Barcode scanners work as keyboard input in any search/entry field.

### 4.2 Sales
- Invoice: date, customer (or walk-in name), lines (product, qty, rate, line discount), invoice
  discount, total, amount paid now, payment account (cash/bank). Remaining = customer credit (udhaar).
- Shows stock and last sale rate to this customer while entering a line. Warns on selling below cost
  or beyond stock (configurable: warn vs block).
- Save → posts stock movements, customer ledger, cash/bank book. Print/preview on save.
- Sale return (against an invoice or standalone) → reverses stock and money.
- Cancel invoice (no delete) with reason.
- Reports: daily/period sales, by customer, by product, profit (sale – average cost).

### 4.3 Purchases
- Bill: date, supplier, supplier's bill no, lines (product, qty, cost), discount, paid now, account.
- Posts stock in, updates product last cost and moving average cost, supplier ledger, cash/bank.
- Purchase return. Reports: by period, supplier, product.

### 4.4 Quotations
- Same entry as a sale but posts nothing. Print. Convert to sale invoice in one action.

### 4.5 Parties (customers & suppliers)
- Name, Urdu name, phone, address, city, credit limit, opening balance, active flag, notes.
- Ledger with running balance; receive payment (customer) / make payment (supplier).
- Receivables & payables summary (who owes how much).

### 4.6 Accounts
- Cash accounts and bank accounts with opening balances.
- Cash Book & Bank Book: all receipts/payments with running balance per day/period.
- Expenses (rent, salaries, bills…) by category. Transfer between accounts (cash → bank deposit).
- Day close summary: opening cash, sales cash, receipts, payments, expenses, closing cash.

### 4.7 Rate comparison
- For a product: every supplier's purchase rates (last, lowest, date) and our sale price/margin.

### 4.8 Printing
- Templates: sale invoice, quotation, purchase bill, receipt/payment voucher, ledger, reports.
- Paper: A4, A5, thermal 80 mm, thermal 58 mm — chosen per document type in Settings, with default
  printer per document type and "print silently" option. Preview always available.
- Shop header (name, address, phone, Urdu name, logo) from Settings. Invoice language follows
  a setting (EN / UR / both).

### 4.9 System
- First run: create login, enter shop details.
- Settings: shop info, language, printers/paper, stock warnings, invoice footer text.
- Backup: automatic on close + daily, keep last N; manual backup/restore to any folder/USB.
- Export any report/list to Excel (.xlsx) and PDF.
- Import products/parties/opening balances from Excel/CSV (later: from old system).
- Audit log of important actions (cancel invoice, stock adjust, restore backup).

## 5. Non-functional
- Startup < 3 s on a modest PC (4 GB RAM, HDD). Typing in entry screens must never lag.
- Data safety: WAL mode, transactions, automatic backups; a crash never leaves half a document.
- Works at 1366×768 and up. Full keyboard operation.
- Urdu uses Noto Nastaliq Urdu (bundled, offline). Digits stay Western (0-9) in both languages.
- Currency `Rs` with thousands separators, no decimals shown unless non-zero paisa.

## 6. Out of scope (for now)
Multi-PC/LAN, cloud sync, roles/permissions, FBR POS integration, GST, online ordering, mobile app.
