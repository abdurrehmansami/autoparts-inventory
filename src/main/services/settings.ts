import { sql } from 'drizzle-orm'
import { defaultSettings, settingsFields, type AppSettings, type SettingsPatch } from '@shared/schemas/settings'
import type { Db } from '../db/client'
import { settings } from '../db/schema'

type Key = keyof AppSettings

/** Stored values merged over defaults. Each key is validated alone so one bad value can't reset the rest. */
export function getSettings(db: Db): AppSettings {
  const result: Record<string, unknown> = { ...defaultSettings }
  for (const row of db.select().from(settings).all()) {
    const schema = settingsFields[row.key as Key]
    if (!schema) continue
    try {
      const parsed = schema.safeParse(JSON.parse(row.value))
      if (parsed.success) result[row.key] = parsed.data
    } catch {
      // corrupt JSON: keep the default
    }
  }
  return result as AppSettings
}

/** Writes only the keys present in `patch`. */
export function updateSettings(db: Db, patch: SettingsPatch): AppSettings {
  db.transaction((tx) => {
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) continue
      tx.insert(settings)
        .values({ key, value: JSON.stringify(value) })
        .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } })
        .run()
    }
  })
  return getSettings(db)
}
