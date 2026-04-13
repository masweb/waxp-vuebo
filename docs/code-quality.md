# Code quality

- When you finish the operations, run `vp fmt` so that oxfmt formats the code according to our preferences.
- Check the auto‑imports so you don’t have to write import statements repeatedly.

```typescript
AutoImport({
  dts: 'auto-imports.d.ts',
  imports: ['vue', 'pinia', 'vee-validate'],
  include: [/\.vue$/, /\.vue\?vue/, /\.ts$/],
  dirs: ['src/composables/**', 'src/stores/**',  'src/types/**' ]
})
```

- Many components also have auto‑import, so you don’t have to import them either.

```typescript
Components({
  dirs: ['src/components/**']
}
```

- All types are auto‑imported because they’re located in the types directory.
