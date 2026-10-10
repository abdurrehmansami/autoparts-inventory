import type { Db } from '../db/client'
import { registerAuth } from './auth'
import { registerProducts } from './products'
import { createRegistry, type Session } from './registry'
import { registerSettings } from './settings'

export function registerIpc(db: Db, dataPath: string): void {
  const session: Session = { userId: null, username: null }
  const handle = createRegistry({ db, session })
  registerAuth(handle)
  registerSettings(handle, dataPath)
  registerProducts(handle)
}
