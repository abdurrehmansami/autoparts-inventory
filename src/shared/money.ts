/** Money is stored and passed around as integer paisa (1 PKR = 100 paisa). */
export type Paisa = number

/** Parse user input like "1,250.5" or "1250" into paisa. Returns null if not a valid amount. */
export function toPaisa(input: string | number): Paisa | null {
  const text = typeof input === 'number' ? String(input) : input.replace(/[,\s]/g, '').replace(/^Rs\.?/i, '')
  if (!/^-?\d+(\.\d{0,2})?$/.test(text)) return null
  const negative = text.startsWith('-')
  const [whole, frac = ''] = text.replace('-', '').split('.')
  const paisa = Number(whole) * 100 + Number(frac.padEnd(2, '0'))
  return negative ? -paisa : paisa
}

/** Paisa → plain decimal string without separators, for form inputs ("1250.50", "1250"). */
export function paisaToInput(paisa: Paisa): string {
  const negative = paisa < 0
  const abs = Math.abs(paisa)
  const whole = Math.floor(abs / 100)
  const frac = abs % 100
  return `${negative ? '-' : ''}${whole}${frac ? '.' + String(frac).padStart(2, '0') : ''}`
}

const grouping = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 })

/** Paisa → display string "Rs 1,250" / "Rs 1,250.50". Digits stay Western in both languages. */
export function formatMoney(paisa: Paisa, { symbol = true }: { symbol?: boolean } = {}): string {
  const negative = paisa < 0
  const abs = Math.abs(paisa)
  const frac = abs % 100
  const body = grouping.format(Math.floor(abs / 100)) + (frac ? '.' + String(frac).padStart(2, '0') : '')
  return `${negative ? '-' : ''}${symbol ? 'Rs ' : ''}${body}`
}

/** qty × unit price − discount, all integers. */
export function lineTotal(qty: number, unitPrice: Paisa, discount: Paisa = 0): Paisa {
  return qty * unitPrice - discount
}

/** Percentage of an amount, rounded to the nearest paisa (e.g. 5% discount). */
export function percentOf(amount: Paisa, percent: number): Paisa {
  return Math.round((amount * percent) / 100)
}
