/**
 * Makes Node's built-in `node:sqlite` look like the small part of better-sqlite3 that
 * Drizzle's sync session uses (prepare → run/all/get/raw, transaction). This lets us use Drizzle
 * with zero native modules, so installers build on any OS.
 */
import { DatabaseSync, type SQLInputValue, type StatementSync } from 'node:sqlite'

export interface RunResult {
  changes: number
  lastInsertRowid: number | bigint
}

class Statement {
  constructor(
    private readonly stmt: StatementSync,
    private readonly rawMode = false
  ) {}

  /** better-sqlite3 mutates the statement; we return a new wrapper so modes never leak between calls. */
  raw(toggle = true): Statement {
    return new Statement(this.stmt, toggle)
  }

  run(...params: SQLInputValue[]): RunResult {
    const r = this.stmt.run(...params)
    return { changes: Number(r.changes), lastInsertRowid: r.lastInsertRowid }
  }

  all(...params: SQLInputValue[]): unknown[] {
    this.stmt.setReturnArrays(this.rawMode)
    return this.stmt.all(...params)
  }

  get(...params: SQLInputValue[]): unknown {
    this.stmt.setReturnArrays(this.rawMode)
    return this.stmt.get(...params)
  }
}

type TxFn<A extends unknown[], R> = ((...args: A) => R) & {
  deferred: (...args: A) => R
  immediate: (...args: A) => R
  exclusive: (...args: A) => R
}

export class SqliteClient {
  readonly native: DatabaseSync
  private savepointCounter = 0

  constructor(path: string) {
    this.native = new DatabaseSync(path)
  }

  prepare(sql: string): Statement {
    return new Statement(this.native.prepare(sql))
  }

  exec(sql: string): void {
    this.native.exec(sql)
  }

  pragma(pragma: string): void {
    this.native.exec(`PRAGMA ${pragma}`)
  }

  /** Same semantics as better-sqlite3: nested calls become savepoints. */
  transaction<A extends unknown[], R>(fn: (...args: A) => R): TxFn<A, R> {
    const wrap =
      (mode: 'DEFERRED' | 'IMMEDIATE' | 'EXCLUSIVE') =>
      (...args: A): R => {
        if (this.native.isTransaction) {
          const name = `nested_${++this.savepointCounter}`
          this.native.exec(`SAVEPOINT ${name}`)
          try {
            const result = fn(...args)
            this.native.exec(`RELEASE ${name}`)
            return result
          } catch (err) {
            this.native.exec(`ROLLBACK TO ${name}; RELEASE ${name}`)
            throw err
          }
        }
        this.native.exec(`BEGIN ${mode}`)
        try {
          const result = fn(...args)
          this.native.exec('COMMIT')
          return result
        } catch (err) {
          if (this.native.isTransaction) this.native.exec('ROLLBACK')
          throw err
        }
      }
    const tx = wrap('DEFERRED') as TxFn<A, R>
    tx.deferred = tx
    tx.immediate = wrap('IMMEDIATE')
    tx.exclusive = wrap('EXCLUSIVE')
    return tx
  }

  close(): void {
    if (this.native.isOpen) this.native.close()
  }
}
