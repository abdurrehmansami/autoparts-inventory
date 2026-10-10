---
name: add-crud-module
description: Build a new master-data module (list + search + create/edit dialog), e.g. customers, suppliers, vehicles, accounts. Use the Products module as the template.
---

# Add a CRUD module

Reference implementation: Products.
- `src/shared/schemas/products.ts` — input schema, list schema, row type
- `src/main/services/products.ts` (+ `products.test.ts`) — list/search/get/create/update
- `src/main/ipc/products.ts` — handlers
- `src/renderer/src/features/products/` — `api.ts`, `products-page.tsx`, `product-form.tsx`

Steps
1. Table exists? If not → skill `add-db-migration`.
2. Shared schemas: `<x>InputSchema` (optional text → `null` via the `optionalText` pattern; money as
   integer paisa), `<x>ListSchema` (search, includeInactive, limit, offset), and a `<X>Row` interface.
3. Service: `list<X>s` (multi-word LIKE search with `escapeLike`, paged, `total` count), `get<X>`,
   `create<X>`, `update<X>`; uniqueness checks throw `errors.duplicate`; `audit()` every write.
   Masters are deactivated (`isActive=false`), **never deleted** once referenced.
4. IPC channels → skill `add-ipc-channel`.
5. UI:
   - Page: title, search input (debounced 150 ms, autofocus), filters, "New" button, TanStack table,
     row double-click/Enter opens the edit dialog, record count. Numeric columns `text-end` + `num`.
   - Form dialog: react-hook-form; string fields for money converted with `toPaisa`; `reset()` on every
     open (`useEffect` on `open`) so new records never inherit old values; toast on save; errors via
     `toastError`. English inputs `dir="ltr"`, Urdu inputs `dir="rtl" className="font-urdu"`.
   - Route in `src/renderer/src/app.tsx`; the menu/toolbar entry already exists in
     `components/layout/navigation.ts` — check the path matches.
6. i18n keys in **both** `en.json` and `ur.json` (the i18n test fails otherwise) → skill `add-translation`.
7. Verify: `npm run typecheck && npm test`, then run the app (`npm run dev`) and try it in both languages.
