import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { AppSettings } from '@shared/schemas/settings'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toastError } from '@/lib/errors'
import { useAppInfo, useSettings, useUpdateSettings } from './api'

type ShopFields = Pick<AppSettings, 'shopName' | 'shopNameUr' | 'shopAddress' | 'shopPhone'>

export function SettingsPage() {
  const { t } = useTranslation()
  const { data: settings } = useSettings()
  const { data: info } = useAppInfo()
  const update = useUpdateSettings()
  const { register, handleSubmit } = useForm<ShopFields>({ values: settings })

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-xl font-semibold">{t('settings.title')}</h1>
      <form
        className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-5"
        onSubmit={handleSubmit((v) =>
          update.mutate(v, { onSuccess: () => toast.success(t('common.saved')), onError: (e) => toastError(e, t) })
        )}
      >
        <h2 className="col-span-2 font-semibold">{t('settings.shop')}</h2>
        <Field label={t('auth.shopName')} htmlFor="shopName">
          <Input id="shopName" {...register('shopName')} />
        </Field>
        <Field label={t('settings.shopNameUr')} htmlFor="shopNameUr">
          <Input id="shopNameUr" dir="rtl" className="font-urdu" {...register('shopNameUr')} />
        </Field>
        <Field label={t('settings.shopAddress')} htmlFor="shopAddress" className="col-span-2">
          <Input id="shopAddress" {...register('shopAddress')} />
        </Field>
        <Field label={t('settings.shopPhone')} htmlFor="shopPhone">
          <Input id="shopPhone" className="num" {...register('shopPhone')} />
        </Field>
        <div className="col-span-2 flex justify-end">
          <Button type="submit" disabled={update.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
      <p className="mt-4 text-xs text-muted">
        {t('settings.dataLocation')}: <span className="num selectable">{info?.dataPath}</span>
      </p>
    </div>
  )
}
