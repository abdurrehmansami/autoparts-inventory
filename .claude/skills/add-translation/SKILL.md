---
name: add-translation
description: Add or change user-visible text in English and Urdu, and keep layouts RTL-safe. Use for any new UI string, error code, or label.
---

# Add translations

1. Add the key to **both** `src/renderer/src/i18n/en.json` and `ur.json`, same path. The test
   `i18n.test.ts` fails if the key sets differ.
2. Group by feature (`products.*`, `sales.*`), shared words in `common.*`, menu items in `menu.*`,
   error codes in `errors.*` (must match `ErrorCode` in `src/shared/errors.ts`).
3. Urdu style: simple shop-floor Urdu used in Karachi markets; common English trade words are fine in
   Urdu script (اسٹاک، انوائس، بل، کوٹیشن، بیک اپ). Keep part numbers, OEM, units (pcs) in English.
   Interpolate with `{{name}}`; never concatenate translated fragments.
4. Layout must work both ways:
   - logical utilities only: `ms/me/ps/pe/start/end/text-start/text-end/border-s/border-e`
   - direction-dependent icons (arrows, logout) get `rtl:-scale-x-100`
   - numbers, codes, phones: `className="num"` or `dir="ltr"`
   - Urdu text inputs: `dir="rtl" className="font-urdu"`
5. Check the screen in Urdu: Nastaliq is tall — ensure rows/buttons don't clip.
