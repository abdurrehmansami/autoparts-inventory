import { app } from 'electron'
import { settingsPatchSchema } from '@shared/schemas/settings'
import { getSettings, updateSettings } from '../services/settings'
import type { Handle } from './registry'

export function registerSettings(handle: Handle, dataPath: string): void {
  handle(
    'app:info',
    null,
    () => ({ version: app.getVersion(), dataPath, platform: process.platform }),
    { public: true }
  )
  // Readable before login so the login screen uses the saved language and shop name.
  handle('settings:get', null, (_, { db }) => getSettings(db), { public: true })
  handle('settings:update', settingsPatchSchema, (input, { db }) => updateSettings(db, input))
}
