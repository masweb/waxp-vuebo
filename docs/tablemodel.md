# TableModel

Componente genérico de tabla CRUD con paginación cursor-based, filtros debounced y modales de creación/edición/borrado.

**Ubicación:** `src/components/TableModel.vue`

---

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `schema` | `TableSchema` | — | Columnas de la tabla (label, key, align) |
| `url` | `string` | — | Endpoint base de la API (ej. `/api/sites`) |
| `title` | `string` | — | Título de la tabla y de los modales |
| `createEditSchema` | `ColumnSchema[]` | `undefined` | Columnas del formulario crear/editar. Si no se pasa, no se muestra el botón de añadir ni editar |
| `filters` | `FilterSchemas` | `undefined` | Columnas filtrables. Añade inputs de búsqueda con debounce (500ms) |
| `limit` | `number` | `25` | Elementos por página |

---

## Slots

### `item-{key}`

Personaliza el renderizado de una celda en la tabla.

**Props:** `{ row, value }`

```vue
<TableModel :schema="schema" url="/api/users" title="Usuarios">
  <template #item-role="{ row }">
    <span class="badge">{{ row.role }}</span>
  </template>
</TableModel>
```

### `form-extra`

Añade campos extra al formulario de creación/edición (después de los campos del `createEditSchema`).

**Props:** `{ values, setFieldValue, setFieldError, errors, editTarget }`

| Prop | Tipo | Descripción |
|------|------|-------------|
| `values` | `Record<string, any>` | Valores reactivos del formulario |
| `setFieldValue` | `(field, value) => void` | Asigna un valor al formulario |
| `setFieldError` | `(field, message) => void` | Asigna un error de validación |
| `errors` | `Record<string, string>` | Errores actuales |
| `editTarget` | `any \| null` | Row en edición (`null` si es creación) |

```vue
<TableModel :schema="schema" url="/api/sites" title="Sites" :create-edit-schema="formSchema">
  <template #form-extra="{ values, setFieldValue }">
    <div class="mb-3">
      <label class="form-label">Locales</label>
      <div v-for="(locale, i) in values.locales" :key="i" class="d-flex gap-2 mb-2">
        <input class="form-control" :value="locale.code" @input="locale.code = $event.target.value" />
        <input class="form-check-input mt-2" type="checkbox" v-model="locale.is_default" />
      </div>
      <button class="btn btn-sm btn-outline-secondary"
        @click="setFieldValue('locales', [...values.locales, { code: '', is_default: false }])">
        + Locale
      </button>
    </div>
  </template>
</TableModel>
```

---

## API esperada

### GET (listado)

`GET {url}?limit=25&cursor={cursor}&filter[{key}_like]={value}`

Respuesta:

```json
{
  "data": [...],
  "next_cursor": 123,
  "has_more": true,
  "total": 45
}
```

### POST / PUT (crear / editar)

`POST {url}` / `PUT {url}/{id}`

Body: todos los `values` del formulario (incluidos los de `form-extra`).

### DELETE

`DELETE {url}/{id}`

---

## Validación

Se valida `required` en los campos de `createEditSchema`. Para validación extra en `form-extra`, usar `setFieldError` desde el slot.

---

## Tipos relacionados

Definidos en `src/types/table.ts`:

```ts
type ColumnAlign = 'start' | 'center' | 'end'

interface ColumnSchema {
  key: string
  label?: string
  align?: ColumnAlign
  required?: boolean
}

type TableSchema = ColumnSchema[]

interface FilterSchema {
  key: string
  label?: string
}

type FilterSchemas = FilterSchema[]
```
