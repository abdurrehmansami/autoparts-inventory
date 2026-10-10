import type { Ref, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Native select: fast, keyboard friendly, and RTL-aware out of the box. */
export function Select({ className, ref, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> }) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-border bg-surface px-2 text-sm text-text focus:border-primary focus:outline-none',
        className
      )}
      {...props}
    />
  )
}
