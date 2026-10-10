import { AppError } from '@shared/errors'
import type { Channel, InputOf, OutputOf } from '@shared/ipc-contract'

/** Typed IPC call. Resolves with data or throws AppError (code = i18n key). */
export async function call<C extends Channel>(channel: C, ...args: InputOf<C> extends void ? [] : [InputOf<C>]): Promise<OutputOf<C>> {
  const result = await window.api.invoke(channel, args[0])
  if (result.ok) return result.data
  throw new AppError(result.error.code, result.error.params)
}
