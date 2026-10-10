import { contextBridge, ipcRenderer } from 'electron'
import type { Channel, InputOf } from '@shared/ipc-contract'

const api = {
  invoke: (channel: Channel, input?: InputOf<Channel>) => ipcRenderer.invoke(channel, input)
}

contextBridge.exposeInMainWorld('api', api)
