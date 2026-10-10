import { beforeEach, describe, expect, it } from 'vitest'
import { settingsPatchSchema } from '@shared/schemas/settings'
import type { Db } from '../db/client'
import { createTestDb } from '../db/test-db'
import { changePassword, hashPassword, isSetUp, login, setup, verifyPassword } from './auth'
import { getSettings, updateSettings } from './settings'

let db: Db

beforeEach(() => {
  db = createTestDb().db
})

describe('auth', () => {
  it('hashes and verifies passwords', () => {
    const hash = hashPassword('secret')
    expect(hash).toMatch(/^scrypt\$/)
    expect(verifyPassword('secret', hash)).toBe(true)
    expect(verifyPassword('wrong', hash)).toBe(false)
  })

  it('sets up once, then logs in', () => {
    expect(isSetUp(db)).toBe(false)
    setup(db, { username: 'owner', password: '1234', shopName: 'Karachi Auto Parts' })
    expect(isSetUp(db)).toBe(true)
    expect(getSettings(db).shopName).toBe('Karachi Auto Parts')
    expect(() => setup(db, { username: 'x', password: '1234', shopName: 'y' })).toThrow('errors.alreadySetUp')
    expect(login(db, { username: 'owner', password: '1234' }).username).toBe('owner')
    expect(() => login(db, { username: 'owner', password: 'nope' })).toThrow('errors.invalidCredentials')
  })

  it('changes password only with the current one', () => {
    const user = setup(db, { username: 'owner', password: '1234', shopName: 'S' })
    expect(() => changePassword(db, user.id, { currentPassword: 'bad', newPassword: '5678' })).toThrow()
    changePassword(db, user.id, { currentPassword: '1234', newPassword: '5678' })
    expect(login(db, { username: 'owner', password: '5678' }).id).toBe(user.id)
  })
})

describe('settings', () => {
  it('a partial update keeps other settings (regression: zod defaults in partial)', () => {
    updateSettings(db, settingsPatchSchema.parse({ shopName: 'Karachi Auto Parts' }))
    updateSettings(db, settingsPatchSchema.parse({ language: 'ur' }))
    const s = getSettings(db)
    expect(s.shopName).toBe('Karachi Auto Parts')
    expect(s.language).toBe('ur')
    expect(s.invoicePaper).toBe('80mm')
  })

  it('rejects unknown keys', () => {
    expect(settingsPatchSchema.safeParse({ hacked: true }).success).toBe(false)
  })
})
