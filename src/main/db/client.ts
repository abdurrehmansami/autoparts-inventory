import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createTableRelationsHelpers, extractTablesRelationalConfig } from 'drizzle-orm'
import { BetterSQLiteSession } from 'drizzle-orm/better-sqlite3/session'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { BaseSQLiteDatabase, SQLiteSyncDialect } from 'drizzle-orm/sqlite-core'
import * as schema from './schema'
import { SqliteClient, type RunResult } from './sqlite-adapter'

export type Db = BaseSQLiteDatabase<'sync', RunResult, typeof schema>

export interface Database {
  db: Db
  client: SqliteClient
}

/** Open (or create) the database file, configure pragmas and run pending migrations. */
export function openDatabase(path: string, migrationsFolder: string): Database {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const client = new SqliteClient(path)
  client.pragma('journal_mode = WAL')
  client.pragma('foreign_keys = ON')
  client.pragma('synchronous = NORMAL')
  client.pragma('busy_timeout = 5000')

  const dialect = new SQLiteSyncDialect()
  const tables = extractTablesRelationalConfig(schema, createTableRelationsHelpers)
  const relational = { fullSchema: schema, schema: tables.tables, tableNamesMap: tables.tableNamesMap }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the session only needs our adapter's better-sqlite3-shaped API
  const session = new BetterSQLiteSession(client as any, dialect, relational, {})
  const db = new BaseSQLiteDatabase('sync', dialect, session, relational) as Db

  dialect.migrate(readMigrationFiles({ migrationsFolder }), session)
  return { db, client }
}
