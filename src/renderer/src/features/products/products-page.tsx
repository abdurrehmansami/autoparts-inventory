import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { formatMoney } from '@shared/money'
import type { ProductRow } from '@shared/schemas/products'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useProducts } from './api'
import { ProductFormDialog } from './product-form'

const col = createColumnHelper<ProductRow>()

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

export function ProductsPage() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [lowStockOnly, setLowStockOnly] = useState(params.get('low') === '1')
  const [editing, setEditing] = useState<ProductRow | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const debouncedSearch = useDebounced(search, 150)
  const { data, isFetching } = useProducts({ search: debouncedSearch, includeInactive, lowStockOnly })
  const urdu = i18n.language === 'ur'

  // F3 / Find menu navigates here with ?focus=search
  useEffect(() => {
    setLowStockOnly(params.get('low') === '1')
    if (params.get('low') !== '1') {
      searchRef.current?.focus()
      searchRef.current?.select()
    }
  }, [params])

  const columns = useMemo(
    () => [
      col.accessor('code', { header: t('products.code'), cell: (c) => <span className="num">{c.getValue()}</span> }),
      col.accessor('partNumber', { header: t('products.partNumber'), cell: (c) => <span className="num">{c.getValue()}</span> }),
      // Pick the language in `cell`, not the accessor: TanStack caches accessor values per row.
      col.accessor('nameEn', {
        id: 'name',
        header: t('products.name'),
        cell: (c) => <span className="font-medium">{(urdu && c.row.original.nameUr) || c.getValue()}</span>
      }),
      col.accessor('brandName', { header: t('products.brand') }),
      col.accessor('categoryName', { header: t('products.category') }),
      col.accessor('location', { header: t('products.location') }),
      col.accessor('stockQty', {
        header: t('products.stock'),
        meta: { numeric: true },
        cell: (c) => {
          const r = c.row.original
          const low = r.stockQty <= r.minStock
          return (
            <span className={cn('num', low && 'rounded bg-warning-soft px-1.5 font-semibold text-warning')}>
              {r.stockQty} <span className="text-xs text-muted">{r.unit}</span>
            </span>
          )
        }
      }),
      col.accessor('salePrice', {
        header: t('products.salePrice'),
        meta: { numeric: true },
        cell: (c) => <span className="num">{formatMoney(c.getValue(), { symbol: false })}</span>
      })
    ],
    [t, urdu]
  )

  const table = useReactTable({ data: data?.rows ?? [], columns, getCoreRowModel: getCoreRowModel() })

  const openForm = (product?: ProductRow) => {
    setEditing(product)
    setFormOpen(true)
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="me-4 text-xl font-semibold">{t('products.title')}</h1>
        <div className="relative min-w-72 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="ps-9"
          />
        </div>
        <Checkbox label={t('products.lowStockOnly')} checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
        <Checkbox label={t('products.showInactive')} checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
        <Button onClick={() => openForm()}>
          <Plus /> {t('products.new')}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-surface-2">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={cn(
                      'border-b border-border px-3 py-2 font-medium text-muted',
                      (h.column.columnDef.meta as { numeric?: boolean })?.numeric ? 'text-end' : 'text-start'
                    )}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                onDoubleClick={() => openForm(row.original)}
                onKeyDown={(e) => e.key === 'Enter' && openForm(row.original)}
                className={cn(
                  'cursor-pointer border-b border-border/60 hover:bg-primary-soft focus:bg-primary-soft focus:outline-none',
                  !row.original.isActive && 'text-muted line-through'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn('px-3 py-1.5', (cell.column.columnDef.meta as { numeric?: boolean })?.numeric ? 'text-end' : 'text-start')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data && data.rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        {isFetching ? t('common.loading') : t('common.records', { count: data?.total ?? 0 })}
      </p>

      <ProductFormDialog open={formOpen} product={editing} onOpenChange={setFormOpen} />
    </div>
  )
}
