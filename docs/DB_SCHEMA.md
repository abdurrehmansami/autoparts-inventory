# Database schema

SQLite file at `userData/data/inventory.db`. Defined in [src/main/db/schema.ts](../src/main/db/schema.ts)
(the source of truth — update this doc when it changes). Migrations in `drizzle/`.

**Conventions**: money = integer **paisa**; qty = integer units; business `date` = `YYYY-MM-DD`;
timestamps = `datetime('now')` UTC text; booleans = 0/1; `status` ∈ `posted | cancelled`.

## Relationships
```
categories ─┐            ┌─ product_cross_refs
brands ─────┼─ products ─┼─ product_vehicles ─ vehicles
            │            └─ stock_movements
parties ─┬─ sales ─ sale_items ─ products          accounts ─┬─ cash_entries
         ├─ sale_returns ─ sale_return_items                 ├─ payments
         ├─ purchases ─ purchase_items                       └─ expenses ─ expense_categories
         ├─ purchase_returns ─ purchase_return_items
         ├─ quotations ─ quotation_items
         ├─ ledger_entries
         └─ payments
```

## System
| Table | Purpose / key columns |
|---|---|
| `users` | Single login. `username` unique, `password_hash` = `scrypt$salt$hash` |
| `settings` | `key` → JSON `value` (shop info, language, printers, warnings) |
| `sequences` | Document counters: `name`, `prefix`, `next_value` (`sale`→`S-`, `purchase`→`P-`, `quotation`→`Q-`, `sale_return`→`SR-`, `purchase_return`→`PR-`, `receipt`→`RV-`, `payment`→`PV-`, `product`→`IT-`) |
| `audit_log` | `action`, `entity`, `entity_id`, `details` (JSON) |

## Catalog
| Table | Key columns |
|---|---|
| `categories` | `name_en` unique, `name_ur` |
| `brands` | `name` unique |
| `vehicles` | `make`, `model`, `year_from`, `year_to`, `engine` |
| `products` | `code` unique (auto `IT-000001`), `part_number`, `oem_number`, `barcode` unique, `name_en`, `name_ur`, `category_id`, `brand_id`, `unit`, `location`, `last_cost`, `avg_cost`, `sale_price`, `min_stock`, `stock_qty` (cache), `is_active` |
| `product_cross_refs` | `product_id`, `ref_number`, `brand` |
| `product_vehicles` | (`product_id`, `vehicle_id`) PK |

## Parties & accounts
| Table | Key columns |
|---|---|
| `parties` | `type` customer/supplier/both, `name`, `name_ur`, `phone`, `address`, `city`, `credit_limit`, `is_active`. Opening balance is a `ledger_entries` row with `ref_type='opening'` |
| `accounts` | `type` cash/bank, `name`, `account_no`. Seeded: "Cash in Hand". Opening balance = `cash_entries` row `ref_type='opening'` |

## Documents
| Table | Key columns |
|---|---|
| `sales` | `invoice_no`, `date`, `customer_id` (null = walk-in) / `customer_name`, `subtotal`, `discount`, `total`, `paid`, `account_id`, `quotation_id`, `status`, `cancel_reason` |
| `sale_items` | `sale_id`, `product_id`, `qty`, `unit_price`, `discount` (line), `line_total`, `unit_cost` (avg cost snapshot) |
| `sale_returns` / `sale_return_items` | `return_no`, optional `sale_id`, `total`, `refunded`, `account_id` / items with `unit_cost` |
| `purchases` | `bill_no`, `supplier_bill_no`, `date`, `supplier_id`, `subtotal`, `discount`, `total`, `paid`, `account_id`, `status` |
| `purchase_items` | `purchase_id`, `product_id`, `qty`, `unit_cost`, `line_total` |
| `purchase_returns` / `purchase_return_items` | `return_no`, optional `purchase_id`, `supplier_id`, `total`, `received` |
| `quotations` / `quotation_items` | like sales, `status` open/converted/cancelled, `valid_until`; post nothing |
| `payments` | `voucher_no`, `direction` in (receipt) / out (payment), `party_id`, `account_id`, `amount` |
| `expense_categories`, `expenses` | `category_id`, `account_id`, `amount` |

## Ledgers (append-only)
| Table | Meaning |
|---|---|
| `stock_movements` | `product_id`, `date`, `qty_change` (signed), `unit_cost`, `ref_type`, `ref_id`. Σ`qty_change` = stock |
| `ledger_entries` | Party ledger. `debit` = party owes us more (credit sale, purchase return); `credit` = owes us less (receipt, purchase, sale return). Balance = Σdebit − Σcredit (+ receivable / − payable) |
| `cash_entries` | Cash & bank books. `amount_in`, `amount_out`, optional `party_id` |

`ref_type` ∈ `opening, sale, sale_return, purchase, purchase_return, payment, expense, transfer, adjustment`.

## Posting rules
| Event | stock_movements | ledger_entries (party) | cash_entries |
|---|---|---|---|
| Sale | −qty each line (`unit_cost` = avg) | debit `total`, credit `paid` (only with customer) | in `paid` |
| Sale return | +qty | credit `total`, debit `refunded` | out `refunded` |
| Purchase | +qty (`unit_cost`) → recompute `avg_cost`, set `last_cost` | credit `total`, debit `paid` | out `paid` |
| Purchase return | −qty | debit `total`, credit `received` | in `received` |
| Receipt from customer | — | credit `amount` | in `amount` |
| Payment to supplier | — | debit `amount` | out `amount` |
| Expense | — | — | out `amount` |
| Transfer A→B | — | — | out on A, in on B |
| Stock adjustment | ±qty | — | — |
| Cancel any of above | reverse rows with same `ref_type`/`ref_id`, note "cancel" | reverse | reverse |

Average cost on purchase: `new_avg = (max(stock,0) × old_avg + qty × unit_cost) / (max(stock,0) + qty)`,
rounded to whole paisa.
