import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { AppError } from '@shared/errors'
import type { ChangePasswordInput, Credentials, SetupInput } from '@shared/schemas/auth'
import type { Db } from '../db/client'
import { users } from '../db/schema'
import { audit } from './audit'
import { updateSettings } from './settings'

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return timingSafeEqual(expected, actual)
}

export function isSetUp(db: Db): boolean {
  return db.select({ id: users.id }).from(users).limit(1).get() !== undefined
}

/** First run: create the single login and save the shop name. */
export function setup(db: Db, input: SetupInput): { id: number; username: string } {
  return db.transaction((tx) => {
    if (isSetUp(tx)) throw new AppError('errors.alreadySetUp')
    const user = tx
      .insert(users)
      .values({ username: input.username, passwordHash: hashPassword(input.password) })
      .returning({ id: users.id, username: users.username })
      .get()
    updateSettings(tx, { shopName: input.shopName })
    audit(tx, 'setup', 'users', user.id)
    return user
  })
}

export function login(db: Db, input: Credentials): { id: number; username: string } {
  const user = db.select().from(users).where(eq(users.username, input.username)).get()
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new AppError('errors.invalidCredentials')
  }
  return { id: user.id, username: user.username }
}

export function changePassword(db: Db, userId: number, input: ChangePasswordInput): void {
  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user || !verifyPassword(input.currentPassword, user.passwordHash)) {
    throw new AppError('errors.invalidCredentials')
  }
  db.update(users)
    .set({ passwordHash: hashPassword(input.newPassword), updatedAt: sql`(datetime('now'))` })
    .where(eq(users.id, userId))
    .run()
  audit(db, 'change_password', 'users', userId)
}
