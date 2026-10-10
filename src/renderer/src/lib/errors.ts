import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import { AppError } from '@shared/errors'

export function errorMessage(err: unknown, t: TFunction): string {
  if (err instanceof AppError) {
    const params = { ...err.params }
    if (typeof params.field === 'string') params.field = t(`products.${params.field}`, { defaultValue: params.field })
    return t(err.code, params)
  }
  console.error(err)
  return t('errors.unknown')
}

export function toastError(err: unknown, t: TFunction): void {
  toast.error(errorMessage(err, t))
}
