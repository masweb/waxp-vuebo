# Add i18n keys: $ARGUMENTS

## Locale files

- Spanish: `src/locales/es.json`
- English: `src/locales/en.json`

## i18n (vue-i18n v11)

- Instance: `src/i18n/i18n.ts` — default locale `es`, persisted in `localStorage('lang')`
- Locales: `src/i18n/locales/es.json` + `src/locales/en.json`
- Auto-imported: `useI18n` available everywhere
- In templates use `t('key')`, in script use `const { t } = useI18n()`

## Steps

1. Read both locale files to understand current structure
2. Add the new key(s) to both `es.json` and `en.json`, maintaining alphabetical order within each section
3. Follow the existing nesting convention (dot-separated keys map to nested objects)
4. Always add to BOTH files — never leave one out of sync
