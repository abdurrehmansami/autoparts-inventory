import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { credentialsSchema, type Credentials } from '@shared/schemas/auth'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { errorMessage } from '@/lib/errors'
import { useSettings } from '@/features/settings/api'
import { useLogin } from './api'
import { AuthLayout } from './auth-layout'

export function LoginPage() {
  const { t } = useTranslation()
  const login = useLogin()
  const { data: settings } = useSettings()
  const { register, handleSubmit, formState } = useForm<Credentials>({ resolver: zodResolver(credentialsSchema) })

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={settings?.shopName}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit((input) => login.mutate(input))}>
        <Field label={t('auth.username')} htmlFor="username" error={formState.errors.username && t('errors.required')}>
          <Input id="username" dir="ltr" autoFocus {...register('username')} />
        </Field>
        <Field label={t('auth.password')} htmlFor="password" error={formState.errors.password && t('errors.required')}>
          <Input id="password" type="password" dir="ltr" {...register('password')} />
        </Field>
        {login.isError && <p className="rounded-md bg-danger/10 p-2 text-sm text-danger">{errorMessage(login.error, t)}</p>}
        <Button type="submit" size="lg" disabled={login.isPending}>
          {t('auth.login')}
        </Button>
      </form>
    </AuthLayout>
  )
}
