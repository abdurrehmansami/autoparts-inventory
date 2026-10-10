/**
 * Every IPC channel between renderer and main, with its input and output types.
 * Add new channels here first; main (ipc/*.ts) and renderer (lib/api.ts) are type-checked against it.
 */
import type { ChangePasswordInput, Credentials, SetupInput } from './schemas/auth'
import type { LookupItem, ProductInput, ProductListInput, ProductRow } from './schemas/products'
import type { AppSettings, SettingsPatch } from './schemas/settings'

export interface AuthStatus {
  isSetUp: boolean
  isLoggedIn: boolean
  username: string | null
}

export interface AppInfo {
  version: string
  dataPath: string
  platform: string
}

export interface Paged<T> {
  rows: T[]
  total: number
}

export interface IpcContract {
  'app:info': { input: void; output: AppInfo }

  'auth:status': { input: void; output: AuthStatus }
  'auth:setup': { input: SetupInput; output: AuthStatus }
  'auth:login': { input: Credentials; output: AuthStatus }
  'auth:logout': { input: void; output: AuthStatus }
  'auth:changePassword': { input: ChangePasswordInput; output: void }

  'settings:get': { input: void; output: AppSettings }
  'settings:update': { input: SettingsPatch; output: AppSettings }

  'products:list': { input: ProductListInput; output: Paged<ProductRow> }
  'products:get': { input: { id: number }; output: ProductRow }
  'products:create': { input: ProductInput; output: ProductRow }
  'products:update': { input: { id: number; data: ProductInput }; output: ProductRow }

  'lookups:categories': { input: void; output: LookupItem[] }
  'lookups:brands': { input: void; output: LookupItem[] }
  'lookups:createCategory': { input: { name: string }; output: LookupItem }
  'lookups:createBrand': { input: { name: string }; output: LookupItem }
}

export type Channel = keyof IpcContract
export type InputOf<C extends Channel> = IpcContract[C]['input']
export type OutputOf<C extends Channel> = IpcContract[C]['output']
