---
name: add-print-template
description: Create or change a printable document (invoice, quotation, voucher, ledger, report) for A4/A5 and 80mm/58mm thermal printers, with preview, silent print and PDF.
---

# Add a print template

Printing runs in the **main process** (see docs/ARCHITECTURE.md → Printing).

1. Template: `src/main/print/templates/<doc>.ts` exports
   `render(data, ctx: { paper: PaperSize; lang: 'en' | 'ur'; shop: AppSettings }): string` returning a
   complete HTML document. Plain template strings, **inline CSS only**, no external assets except
   fonts already bundled. Escape every user value with `escapeHtml`.
2. Paper rules:
   - `A4`/`A5`: `@page { size: A4; margin: 12mm }`, table layout, shop header with logo/name/address.
   - `80mm`: body width `72mm`, `@page { size: 80mm auto; margin: 0 }`, font 11–12px, no borders,
     one item per line with qty × rate on the next line; total block bold.
   - `58mm`: body width `48mm`, font 10px, drop the rate column.
   - Urdu: `<html dir="rtl" lang="ur">`, Nastaliq font, `line-height: 2`; numbers in `<span class="num">`
     (LTR, Inter, tabular-nums).
3. Data loader: a service function that returns everything the template needs in one object (no DB
   access inside templates).
4. Register in `src/main/print/index.ts` map `{ docType: { load, render } }`. The `print:document`
   IPC channel handles `mode: 'preview' | 'print' | 'pdf'`:
   - preview → visible BrowserWindow with the HTML and a Print button
   - print → hidden window, `webContents.print({ silent: settings.printSilently, deviceName: settings.invoicePrinter, margins: { marginType: 'none' } })`
   - pdf → `webContents.printToPDF({ pageSize })` + save dialog
5. Test: unit-test `render()` output contains totals/lines (string assertions); manually preview each
   paper size in EN and UR. Thermal output: print to "Microsoft Print to PDF"/CUPS-PDF with a custom
   80 mm paper size if no thermal printer is attached.
