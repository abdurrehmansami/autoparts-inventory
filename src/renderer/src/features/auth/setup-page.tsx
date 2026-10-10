import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { setupSchema } from '@shared/schemas/auth'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toastError } from '@/lib/errors'
import { useSetup } from './api'
import { AuthLayout } from './auth-layout'

const formSchema = setupSchema
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'mismatch' })
type FormValues = z.infer<typeof formSchema>

export function SetupPage() {
  const { t } = useTranslation()
  const setup = useSetup()
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(formSchema) })
  const err = (name: keyof FormValues) =>
    formState.errors[name] ? (name === 'confirmPassword' ? t('auth.passwordsDontMatch') : t('errors.required')) : undefined

  return (
    <AuthLayout title={t('auth.setupTitle')} subtitle={t('auth.setupSubtitle')}>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(({ confirmPassword: _, ...input }) => setup.mutate(input, { onError: (e) => toastError(e, t) }))}
      >
        <Field label={t('auth.shopName')} htmlFor="shopName" error={err('shopName')}>
          <Input id="shopName" autoFocus {...register('shopName')} />
        </Field>
        <Field label={t('auth.username')} htmlFor="username" error={err('username')}>
          <Input id="username" dir="ltr" {...register('username')} />
        </Field>
        <Field label={t('auth.password')} htmlFor="password" error={err('password')}>
          <Input id="password" type="password" dir="ltr" {...register('password')} />
        </Field>
        <Field label={t('auth.confirmPassword')} htmlFor="confirmPassword" error={err('confirmPassword')}>
          <Input id="confirmPassword" type="password" dir="ltr" {...register('confirmPassword')} />
        </Field>
        <Button type="submit" size="lg" disabled={setup.isPending}>
          {t('auth.createAccount')}
        </Button>
      </form>
    </AuthLayout>
  )
}
