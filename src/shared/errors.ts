/**
 * Error codes are i18n keys (see renderer i18n `errors.*`), so the UI can show them in English or Urdu.
 * Add a code here AND in both en.json / ur.json.
 */
export type ErrorCode =
  | 'errors.unknown'
  | 'errors.validation'
  | 'errors.unauthorized'
  | 'errors.invalidCredentials'
  | 'errors.alreadySetUp'
  | 'errors.notFound'
  | 'errors.duplicate'
  | 'errors.insufficientStock'

export interface AppErrorPayload {
  code: ErrorCode
  params?: Record<string, string | number>
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly params?: Record<string, string | number>

  constructor(code: ErrorCode, params?: Record<string, string | number>) {
    super(code)
    this.name = 'AppError'
    this.code = code
    this.params = params
  }

  toPayload(): AppErrorPayload {
    return { code: this.code, params: this.params }
  }
}

export type IpcResult<T> = { ok: true; data: T } | { ok: false; error: AppErrorPayload }
