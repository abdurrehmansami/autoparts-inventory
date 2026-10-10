import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProductInput, ProductListInput } from '@shared/schemas/products'
import { call } from '@/lib/api'

export const productKeys = {
  all: ['products'] as const,
  list: (input: ProductListInput) => ['products', 'list', input] as const,
  categories: ['lookups', 'categories'] as const,
  brands: ['lookups', 'brands'] as const
}

export function useProducts(input: ProductListInput) {
  return useQuery({
    queryKey: productKeys.list(input),
    queryFn: () => call('products:list', input),
    placeholderData: keepPreviousData
  })
}

export function useSaveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ProductInput }) =>
      id ? call('products:update', { id, data }) : call('products:create', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useCategories() {
  return useQuery({ queryKey: productKeys.categories, queryFn: () => call('lookups:categories') })
}

export function useBrands() {
  return useQuery({ queryKey: productKeys.brands, queryFn: () => call('lookups:brands') })
}

export function useCreateLookup(kind: 'category' | 'brand') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => call(kind === 'category' ? 'lookups:createCategory' : 'lookups:createBrand', { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: kind === 'category' ? productKeys.categories : productKeys.brands })
  })
}
