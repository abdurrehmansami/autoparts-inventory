import type { IpcResult } from '@shared/errors'
import type { Channel, InputOf, OutputOf } from '@shared/ipc-contract'

declare global {
  interface Window {
    api: {
      invoke<C extends Channel>(channel: C, input?: InputOf<C>): Promise<IpcResult<OutputOf<C>>>
    }
  }
}

export {}
