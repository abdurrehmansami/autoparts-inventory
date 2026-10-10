import type { InputHTMLAttributes } from 'react'

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="size-4 accent-primary" {...props} />
      {label}
    </label>
  )
}
