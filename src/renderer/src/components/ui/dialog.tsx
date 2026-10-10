import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root

interface DialogContentProps {
  title: string
  description?: string
  className?: string
  children: ReactNode
}

export function DialogContent({ title, description, className, children }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40" />
      <DialogPrimitive.Content
        className={cn(
          'fixed start-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-y-1/2 overflow-y-auto rounded-lg bg-surface p-6 shadow-xl ltr:-translate-x-1/2 rtl:translate-x-1/2',
          className
        )}
        {...(!description && { 'aria-describedby': undefined })}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <DialogPrimitive.Title className="text-lg font-semibold">{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description className="text-sm text-muted">{description}</DialogPrimitive.Description>}
          </div>
          <DialogPrimitive.Close className="rounded p-1 text-muted hover:bg-surface-2" aria-label="Close">
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
