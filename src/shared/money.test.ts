import { describe, expect, it } from 'vitest'
import { formatMoney, lineTotal, paisaToInput, percentOf, toPaisa } from './money'

describe('money', () => {
  it('parses user input to paisa', () => {
    expect(toPaisa('1,250')).toBe(125000)
    expect(toPaisa('1250.5')).toBe(125050)
    expect(toPaisa('0.05')).toBe(5)
    expect(toPaisa('Rs 99')).toBe(9900)
    expect(toPaisa('-10.25')).toBe(-1025)
    expect(toPaisa(12.3)).toBe(1230)
    expect(toPaisa('1.234')).toBeNull()
    expect(toPaisa('abc')).toBeNull()
    expect(toPaisa('')).toBeNull()
  })

  it('formats paisa for display', () => {
    expect(formatMoney(125000)).toBe('Rs 1,250')
    expect(formatMoney(125050)).toBe('Rs 1,250.50')
    expect(formatMoney(-500)).toBe('-Rs 5')
    expect(formatMoney(123456789, { symbol: false })).toBe('1,234,567.89')
  })

  it('round-trips through form input', () => {
    for (const p of [0, 5, 100, 125050, -1025]) expect(toPaisa(paisaToInput(p))).toBe(p)
  })

  it('computes line totals and percentages in integers', () => {
    expect(lineTotal(3, 33333, 100)).toBe(99899)
    expect(percentOf(99999, 5)).toBe(5000)
  })
})
