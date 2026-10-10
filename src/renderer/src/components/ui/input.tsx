import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ref, ...props }: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none aria-invalid:border-danger disabled:bg-surface-2',
        className
      )}
      {...props}
    />
  )
}
