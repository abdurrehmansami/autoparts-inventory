import { ipcMain } from 'electron'
import { z, type ZodType } from 'zod'
import { AppError, type IpcResult } from '@shared/errors'
import type { Channel, InputOf, OutputOf } from '@shared/ipc-contract'
import type { Db } from '../db/client'

export interface Session {
  userId: number | null
  username: string | null
}

export interface IpcContext {
  db: Db
  session: Session
}

interface HandleOptions {
  /** Callable without login (auth + boot channels only). */
  public?: boolean
}

/**
 * Register a typed, validated handler. Input is parsed with `schema`; thrown AppErrors are sent to
 * the renderer as `{ ok: false, error }`; anything else is logged and reported as errors.unknown.
 */
export function createRegistry(ctx: IpcContext) {
  return function handle<C extends Channel>(
    channel: C,
    schema: ZodType<InputOf<C>> | null,
    fn: (input: InputOf<C>, ctx: IpcContext) => OutputOf<C>,
    options: HandleOptions = {}
  ): void {
    ipcMain.handle(channel, (_event, rawInput: unknown): IpcResult<OutputOf<C>> => {
      try {
        if (!options.public && ctx.session.userId === null) throw new AppError('errors.unauthorized')
        let input = rawInput as InputOf<C>
        if (schema) {
          const parsed = schema.safeParse(rawInput)
          if (!parsed.success) {
            console.warn(`[ipc] ${channel} invalid input`, z.prettifyError(parsed.error))
            throw new AppError('errors.validation')
          }
          input = parsed.data
        }
        return { ok: true, data: fn(input, ctx) }
      } catch (err) {
        if (err instanceof AppError) return { ok: false, error: err.toPayload() }
        console.error(`[ipc] ${channel} failed`, err)
        return { ok: false, error: { code: 'errors.unknown' } }
      }
    })
  }
}

export type Handle = ReturnType<typeof createRegistry>
