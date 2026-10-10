---
name: add-report
description: Add a report screen (sales, purchases, stock, profit, ledger, day close, rate comparison) with filters, totals, print and Excel export.
---

# Add a report

1. Query: a service function in `src/main/services/reports/<name>.ts` taking `(db, filters)` and
   returning `{ rows, totals }`. Use SQL aggregation (`sum`, `group by`) — not JS loops over all
   rows. Exclude `status = 'cancelled'` documents. All money stays in paisa.
   - Profit uses `sale_items.unit_cost` (snapshot), never the current product cost.
   - Stock as of a date = `SUM(stock_movements.qty_change) WHERE date <= ?`.
   - Party balance = `SUM(debit) - SUM(credit)` from `ledger_entries`; running balance via window
     function `SUM(debit - credit) OVER (ORDER BY date, id)`.
2. Test it with a small fixture in `createTestDb()` — assert totals to the paisa.
3. IPC channel `reports:<name>` → skill `add-ipc-channel`.
4. Page under `features/reports/<name>-page.tsx`: filter bar (date range default = today, party/
   product pickers), table, sticky totals row, buttons: Print (→ `add-print-template`), Excel export.
5. Excel export: generate in main (`exceljs`, MIT) to a save-dialog path; numbers exported as numbers
   (rupees = paisa / 100 with 2-decimals format), not strings.
6. i18n both languages; numbers in `num` spans; verify in EN + UR.
