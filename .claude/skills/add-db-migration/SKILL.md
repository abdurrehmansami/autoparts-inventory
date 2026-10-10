---
name: add-db-migration
description: Change the SQLite schema (new table, column, index) and generate a Drizzle migration. Use whenever src/main/db/schema.ts must change.
---

# Add a database migration

1. Edit `src/main/db/schema.ts`. Follow existing patterns:
   - helpers `id()`, `createdAt()`, `updatedAt()`, `isActive()`, `status()`
   - money columns are `integer(...)` holding **paisa**; quantities are integers
   - business dates are `text('date')` as `YYYY-MM-DD`
   - add indexes for every column used in WHERE/JOIN/ORDER BY on large tables
   - new columns on existing tables must be nullable or have a `.default(...)` (existing rows!)
2. Run `npm run db:generate -- --name <short_snake_name>`. This writes `drizzle/NNNN_<name>.sql`
   and updates `drizzle/meta/`. Read the SQL and check it does what you expect.
   - SQLite can't alter columns; drizzle-kit may generate a table-rebuild (`__new_` table + copy).
     Make sure the copy keeps all data. If it drops data, write the migration by hand instead.
3. **Never edit a migration that has shipped** (exists in a release). Add a new one.
4. Update `docs/DB_SCHEMA.md` (table list + posting rules if they change).
5. Add/adjust service tests — `createTestDb()` applies all migrations, so tests prove the SQL works.
6. `npm run typecheck && npm test`.

Migrations run automatically at startup (`openDatabase` → `dialect.migrate`) before the window opens,
inside a transaction; a failing migration shows an error dialog and leaves the DB untouched.
