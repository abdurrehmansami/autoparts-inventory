import { resolve } from 'node:path'
import { openDatabase, type Database } from './client'

/** Fresh in-memory database with all migrations applied. For service tests only. */
export function createTestDb(): Database {
  return openDatabase(':memory:', resolve(__dirname, '../../../drizzle'))
}
