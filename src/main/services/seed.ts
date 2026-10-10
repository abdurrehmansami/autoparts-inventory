import type { Db } from '../db/client'
import { accounts, expenseCategories } from '../db/schema'

/** Idempotent defaults every installation needs. Runs on every startup after migrations. */
export function seedDefaults(db: Db): void {
  db.transaction((tx) => {
    tx.insert(accounts).values({ type: 'cash', name: 'Cash in Hand' }).onConflictDoNothing().run()
    const expenseNames: Array<[string, string]> = [
      ['Rent', 'کرایہ'],
      ['Salaries', 'تنخواہیں'],
      ['Electricity', 'بجلی'],
      ['Transport', 'ٹرانسپورٹ'],
      ['Miscellaneous', 'متفرق']
    ]
    for (const [nameEn, nameUr] of expenseNames) {
      tx.insert(expenseCategories).values({ nameEn, nameUr }).onConflictDoNothing().run()
    }
  })
}
