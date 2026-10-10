import { describe, expect, it } from 'vitest'
import en from './en.json'
import ur from './ur.json'

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  )
}

describe('translations', () => {
  it('English and Urdu have exactly the same keys', () => {
    expect(keys(ur).sort()).toEqual(keys(en).sort())
  })
})
