import { changePasswordSchema, credentialsSchema, setupSchema } from '@shared/schemas/auth'
import type { AuthStatus } from '@shared/ipc-contract'
import { changePassword, isSetUp, login, setup } from '../services/auth'
import type { Handle, IpcContext } from './registry'

function status({ db, session }: IpcContext): AuthStatus {
  return { isSetUp: isSetUp(db), isLoggedIn: session.userId !== null, username: session.username }
}

export function registerAuth(handle: Handle): void {
  handle('auth:status', null, (_, ctx) => status(ctx), { public: true })

  handle(
    'auth:setup',
    setupSchema,
    (input, ctx) => {
      const user = setup(ctx.db, input)
      ctx.session.userId = user.id
      ctx.session.username = user.username
      return status(ctx)
    },
    { public: true }
  )

  handle(
    'auth:login',
    credentialsSchema,
    (input, ctx) => {
      const user = login(ctx.db, input)
      ctx.session.userId = user.id
      ctx.session.username = user.username
      return status(ctx)
    },
    { public: true }
  )

  handle(
    'auth:logout',
    null,
    (_, ctx) => {
      ctx.session.userId = null
      ctx.session.username = null
      return status(ctx)
    },
    { public: true }
  )

  handle('auth:changePassword', changePasswordSchema, (input, ctx) =>
    changePassword(ctx.db, ctx.session.userId!, input)
  )
}
