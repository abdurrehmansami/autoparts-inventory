---
name: add-ipc-channel
description: Expose a new main-process operation to the React UI through typed, validated IPC. Use when the renderer needs data or an action from the database/OS.
---

# Add an IPC channel

Order matters — the contract first, so the compiler guides the rest.

1. **Contract** — add to `IpcContract` in `src/shared/ipc-contract.ts`:
   `'module:action': { input: XInput; output: XOutput }`. Naming: `<module>:<verb>` (`sales:create`).
2. **Schema** — zod input schema in `src/shared/schemas/<module>.ts` (shared, so forms can reuse it).
   Use `z.input<>` for the input type when the schema has defaults/transforms.
3. **Service** — business logic in `src/main/services/<module>.ts` as plain functions taking `db: Db`
   first. Throw `AppError('errors.someCode', params)` for user-facing failures (add the code to
   `src/shared/errors.ts` and both i18n files). Multi-row writes go in `db.transaction`.
4. **Handler** — in `src/main/ipc/<module>.ts`:
   ```ts
   handle('module:action', schema, (input, { db }) => serviceFn(db, input))
   ```
   Register the module in `src/main/ipc/index.ts`. Handlers stay one-liners; no logic here.
   Only auth/boot channels may pass `{ public: true }`.
5. **Renderer hook** — in `src/renderer/src/features/<module>/api.ts` wrap `call('module:action', input)`
   in `useQuery` (reads, key from a `<module>Keys` object) or `useMutation` (writes, invalidate the
   affected keys in `onSuccess`).
6. Test the service (`*.test.ts` next to it, using `createTestDb()`), then `npm run typecheck && npm test`.

Never import `electron`, `node:*` or `src/main/**` from the renderer, and never send SQL over IPC.
