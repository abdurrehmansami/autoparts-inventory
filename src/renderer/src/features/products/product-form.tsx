import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { paisaToInput, toPaisa } from '@shared/money'
import type { LookupItem, ProductRow } from '@shared/schemas/products'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { toastError } from '@/lib/errors'
import { useBrands, useCategories, useCreateLookup, useSaveProduct } from './api'

interface FormValues {
  code: string
  partNumber: string
  oemNumber: string
  barcode: string
  nameEn: string
  nameUr: string
  categoryId: string
  brandId: string
  unit: string
  location: string
  salePrice: string
  lastCost: string
  minStock: string
  isActive: boolean
  notes: string
}

const UNITS = ['pcs', 'set', 'pair', 'kit', 'ltr', 'ft', 'mtr', 'kg', 'box']

function toForm(p?: ProductRow): FormValues {
  return {
    code: p?.code ?? '',
    partNumber: p?.partNumber ?? '',
    oemNumber: p?.oemNumber ?? '',
    barcode: p?.barcode ?? '',
    nameEn: p?.nameEn ?? '',
    nameUr: p?.nameUr ?? '',
    categoryId: p?.categoryId ? String(p.categoryId) : '',
    brandId: p?.brandId ? String(p.brandId) : '',
    unit: p?.unit ?? 'pcs',
    location: p?.location ?? '',
    salePrice: p ? paisaToInput(p.salePrice) : '',
    lastCost: p ? paisaToInput(p.lastCost) : '',
    minStock: p ? String(p.minStock) : '0',
    isActive: p?.isActive ?? true,
    notes: p?.notes ?? ''
  }
}

/** Select + inline "add new" for categories/brands. */
function LookupSelect({
  kind,
  items,
  value,
  onChange,
  id
}: {
  kind: 'category' | 'brand'
  items: LookupItem[]
  value: string
  onChange: (v: string) => void
  id: string
}) {
  const { t } = useTranslation()
  const create = useCreateLookup(kind)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  if (adding) {
    const submit = () => {
      if (!name.trim()) return setAdding(false)
      create.mutate(name.trim(), {
        onSuccess: (item) => {
          onChange(String(item.id))
          setAdding(false)
          setName('')
        },
        onError: (e) => toastError(e, t)
      })
    }
    return (
      <Input
        id={id}
        autoFocus
        value={name}
        placeholder={t(kind === 'category' ? 'products.newCategory' : 'products.newBrand')}
        onChange={(e) => setName(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
          if (e.key === 'Escape') {
            e.stopPropagation()
            setAdding(false)
          }
        }}
      />
    )
  }
  return (
    <div className="flex gap-1">
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t('common.none')}</option>
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </Select>
      <Button variant="secondary" size="icon" onClick={() => setAdding(true)} aria-label={t('common.add')} title={t('common.add')}>
        <Plus />
      </Button>
    </div>
  )
}

export function ProductFormDialog({
  open,
  product,
  onOpenChange
}: {
  open: boolean
  product?: ProductRow
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const save = useSaveProduct()
  const { data: categories = [] } = useCategories()
  const { data: brands = [] } = useBrands()
  const { register, handleSubmit, formState, setValue, watch, setError, reset } = useForm<FormValues>({
    defaultValues: toForm(product)
  })

  // Fresh form on every open, so a new product never inherits the previous entry's values.
  useEffect(() => {
    if (open) reset(toForm(product))
  }, [open, product, reset])

  const onSubmit = handleSubmit((v) => {
    const salePrice = v.salePrice === '' ? 0 : toPaisa(v.salePrice)
    const lastCost = v.lastCost === '' ? 0 : toPaisa(v.lastCost)
    if (salePrice === null || salePrice < 0) return setError('salePrice', { message: t('errors.invalidAmount') })
    if (lastCost === null || lastCost < 0) return setError('lastCost', { message: t('errors.invalidAmount') })
    save.mutate(
      {
        id: product?.id,
        data: {
          code: v.code,
          partNumber: v.partNumber,
          oemNumber: v.oemNumber,
          barcode: v.barcode,
          nameEn: v.nameEn,
          nameUr: v.nameUr,
          categoryId: v.categoryId ? Number(v.categoryId) : null,
          brandId: v.brandId ? Number(v.brandId) : null,
          unit: v.unit,
          location: v.location,
          salePrice,
          lastCost,
          minStock: Math.max(0, Math.trunc(Number(v.minStock) || 0)),
          isActive: v.isActive,
          notes: v.notes
        }
      },
      {
        onSuccess: () => {
          toast.success(t('common.saved'))
          onOpenChange(false)
        },
        onError: (e) => toastError(e, t)
      }
    )
  })

  const e = formState.errors
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={product ? t('products.editTitle') : t('products.newTitle')} className="max-w-3xl">
        <form onSubmit={onSubmit} className="grid grid-cols-6 gap-4">
          <Field className="col-span-3" label={t('products.nameEn')} htmlFor="nameEn" error={e.nameEn && t('errors.required')}>
            <Input id="nameEn" dir="ltr" autoFocus {...register('nameEn', { required: true })} aria-invalid={!!e.nameEn} />
          </Field>
          <Field className="col-span-3" label={t('products.nameUr')} htmlFor="nameUr">
            <Input id="nameUr" dir="rtl" className="font-urdu" {...register('nameUr')} />
          </Field>

          <Field className="col-span-2" label={t('products.code')} htmlFor="code" hint={product ? undefined : t('products.codeHint')}>
            <Input id="code" className="num" {...register('code')} />
          </Field>
          <Field className="col-span-2" label={t('products.partNumber')} htmlFor="partNumber">
            <Input id="partNumber" className="num" {...register('partNumber')} />
          </Field>
          <Field className="col-span-2" label={t('products.oemNumber')} htmlFor="oemNumber">
            <Input id="oemNumber" className="num" {...register('oemNumber')} />
          </Field>

          <Field className="col-span-2" label={t('products.category')} htmlFor="categoryId">
            <LookupSelect kind="category" id="categoryId" items={categories} value={watch('categoryId')} onChange={(v) => setValue('categoryId', v)} />
          </Field>
          <Field className="col-span-2" label={t('products.brand')} htmlFor="brandId">
            <LookupSelect kind="brand" id="brandId" items={brands} value={watch('brandId')} onChange={(v) => setValue('brandId', v)} />
          </Field>
          <Field className="col-span-2" label={t('products.barcode')} htmlFor="barcode">
            <Input id="barcode" className="num" {...register('barcode')} />
          </Field>

          <Field className="col-span-2" label={t('products.salePrice')} htmlFor="salePrice" error={e.salePrice?.message}>
            <Input id="salePrice" className="num" inputMode="decimal" {...register('salePrice')} />
          </Field>
          <Field className="col-span-2" label={t('products.lastCost')} htmlFor="lastCost" error={e.lastCost?.message}>
            <Input id="lastCost" className="num" inputMode="decimal" {...register('lastCost')} />
          </Field>
          <Field className="col-span-1" label={t('products.unit')} htmlFor="unit">
            <Select id="unit" {...register('unit')}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Field>
          <Field className="col-span-1" label={t('products.minStock')} htmlFor="minStock">
            <Input id="minStock" className="num" inputMode="numeric" {...register('minStock')} />
          </Field>

          <Field className="col-span-2" label={t('products.location')} htmlFor="location">
            <Input id="location" {...register('location')} />
          </Field>
          <Field className="col-span-4" label={t('products.notes')} htmlFor="notes">
            <Input id="notes" {...register('notes')} />
          </Field>

          <div className="col-span-6 flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-1">
              <Checkbox label={t('common.active')} {...register('isActive')} />
              {product && <p className="text-xs text-muted">{t('products.stockNote')}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
