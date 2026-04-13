# Forms (vee-validate)

## Setup

- `vee-validate` is auto-imported — use `useForm` + `useField`
- Validation rules → `src/composables/useValidation.ts`

## Form/Field options

- Always pass options explicitly per form/field (global `configure()` is unreliable):
  - `useForm({ validateOnMount: false })`
  - `useField('name', rule, { validateOnValueUpdate: false })`
- `validateOnModelUpdate` does NOT exist in vee-validate v4 — omit it

## Validation rules

- Use string rule name in `useField('field', 'required', ...)` — **never** inline validator functions
