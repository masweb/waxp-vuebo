# Block Menu

Documento de referencia para la implementación del bloque Menu en el backend.

---

## Tipo de bloque

```
type = 'Menu'
```

Añadir a los tipos de bloque soportados por el backend (junto a `Text`, `Image`, `Space`, `DarkMode`, `LanguageSwitcher`, `Button`).

---

## Propiedades del bloque

El bloque Menu no usa `block.locales`. Su dato localizado es `block.menu`.

### Propiedades propias

| Campo | Tipo | Default | Descripción |
|---|---|---|---|
| `menu` | `MenuItem[]` | `[]` | Array de items del menú (resuelto por locale, ver abajo) |
| `menuColors` | `MenuColors` | ver defaults | Colores del texto: normal, hover, active × light/dark |
| `menuFont` | `Font` | `{ family: '', weight: 400, italic: false }` | Fuente para nivel 1 |
| `menuFontSize` | `null \| number` | `null` | Tamaño de fuente nivel 1 (null = heredado del site) |
| `menuLineHeight` | `null \| number` | `null` | Altura de línea nivel 1 (null = heredado) |
| `menuSubFont` | `Font` | `{ family: '', weight: 400, italic: false }` | Fuente para subniveles (nivel 2+) |
| `menuSubFontSize` | `null \| number` | `null` | Tamaño de fuente subniveles |
| `menuSubLineHeight` | `null \| number` | `null` | Altura de línea subniveles |
| `isMobileMenu` | `boolean` | `false` | Marcado como menú móvil (pendiente de desarrollar) |

### Defaults de `menuColors`

```json
{
  "color": { "light": "#212529", "dark": "#f8f9fa" },
  "hover": { "light": "#0d6efd", "dark": "#6ea8fe" },
  "active": { "light": "#0a58ca", "dark": "#5aa4f0" }
}
```

---

## Tipos

### MenuItem

```typescript
interface MenuItem {
  label: string        // texto del enlace en el idioma actual
  link?: BlockLink     // enlace opcional (interno, externo, ancla)
  children?: MenuItem[] // sub-items recursivos
}
```

**Importante**: `label` es un string plano, NO un mapa de locales. La localización se maneja a nivel del array `menu` completo (ver sección de almacenamiento).

### BlockLink (ya existente)

```typescript
type BlockLinkType = 'internal' | 'external' | 'anchor'

interface BlockLink {
  type: BlockLinkType
  url: string
}
```

### MenuColors

```typescript
interface MenuColors {
  color: BlockButtonColors   // { light: string, dark: string }
  hover: BlockButtonColors
  active: BlockButtonColors
}
```

`BlockButtonColors` ya existe: `{ light: string, dark: string }`.

### Font (ya existente)

```typescript
interface Font {
  family: string
  weight: number
  italic?: boolean
}
```

---

## Almacenamiento en BD vs respuesta API

### En la base de datos

El campo `menu` se almacena como un mapa anidado por locale, igual que `block.locales`:

```json
{
  "menu": {
    "es": [
      { "label": "Inicio", "link": { "type": "internal", "url": "/" } },
      {
        "label": "Nosotros",
        "link": { "type": "internal", "url": "/nosotros" },
        "children": [
          { "label": "Equipo", "link": { "type": "internal", "url": "/nosotros/equipo" } },
          { "label": "Historia", "link": { "type": "internal", "url": "/nosotros/historia" } }
        ]
      }
    ],
    "en": [
      { "label": "Home", "link": { "type": "internal", "url": "/en" } },
      { "label": "Contact", "link": { "type": "internal", "url": "/en/contact" } }
    ]
  }
}
```

- Cada locale tiene su propio array de `MenuItem[]` independiente
- Un idioma puede tener más o menos items que otro
- Los enlaces internos usan las rutas reales de cada locale (`/nosotros` en ES, `/about` en EN)
- Los children se anidan recursivamente sin límite de profundidad

### En la respuesta API (`?locale=es`)

Se resuelve a un array plano de items en el locale solicitado:

```json
{
  "menu": [
    { "label": "Inicio", "link": { "type": "internal", "url": "/" } },
    {
      "label": "Nosotros",
      "link": { "type": "internal", "url": "/nosotros" },
      "children": [
        { "label": "Equipo", "link": { "type": "internal", "url": "/nosotros/equipo" } },
        { "label": "Historia", "link": { "type": "internal", "url": "/nosotros/historia" } }
      ]
    }
  ]
}
```

- Si el locale no tiene menú, se devuelve `[]`
- La estructura es idéntica a la BD pero sin la clave del locale

### Al guardar (`PUT ?locale=es`)

El body contiene el array `menu` completo para ese locale:

```json
{
  "menu": [
    { "label": "Inicio", "link": { "type": "internal", "url": "/" } }
  ]
}
```

El backend mergea:
- Reemplaza `menu.es` con el array recibido
- Preserva `menu.en` y otros locales intactos

---

## Ciclo de vida del bloque

### Creación (POST `/api/sites/{id}/blocks`)

El frontend envía el bloque sin `menu` o con `menu: []`. El backend lo almacena como:

```json
{ "menu": {} }
```

(mapa vacío, sin items para ningún locale)

### Primera edición

El usuario añade items al menú en el locale activo (ej: ES). Al guardar:

```json
// PUT ?locale=es
{ "menu": [{ "label": "Inicio", "link": { "type": "internal", "url": "/" } }] }
```

El backend almacena:

```json
{ "menu": { "es": [{ "label": "Inicio", "link": { "type": "internal", "url": "/" } }] } }
```

### Cambio de idioma

El usuario cambia a EN. El frontend carga el bloque con `?locale=en`. Si no hay items para EN, devuelve `menu: []`. El usuario crea el menú en EN y guarda:

```json
// PUT ?locale=en
{ "menu": [{ "label": "Home", "link": { "type": "internal", "url": "/en" } }] }
```

El backend mergea:

```json
{
  "menu": {
    "es": [{ "label": "Inicio", "link": { "type": "internal", "url": "/" } }],
    "en": [{ "label": "Home", "link": { "type": "internal", "url": "/en" } }]
  }
}
```

---

## Validaciones backend

1. `menu` debe ser un array de `MenuItem` válido (si viene como array en el request)
2. Cada `MenuItem` debe tener `label` (string, no vacío si tiene enlace)
3. `link.type` debe ser `'internal'` | `'external'` | `'anchor'`
4. `link.url` debe ser un string no vacío cuando `link` está presente
5. `children` es opcional, si existe debe ser un array de `MenuItem`
6. No hay límite de profundidad de anidación
7. Los campos `menuColors`, `menuFont`, `menuFontSize`, `menuLineHeight`, `menuSubFont`, `menuSubFontSize`, `menuSubLineHeight`, `isMobileMenu` son compartidos entre locales (no se almacenan por idioma)

---

## Resumen de cambios necesarios en el backend

1. Añadir `'Menu'` a los tipos de bloque soportados
2. Añadir las propiedades del bloque: `menu`, `menuColors`, `menuFont`, `menuFontSize`, `menuLineHeight`, `menuSubFont`, `menuSubFontSize`, `menuSubLineHeight`, `isMobileMenu`
3. Implementar la resolución de `menu` por locale (mapa → array)
4. Implementar el mergeo de `menu` por locale al guardar (reemplazar solo el locale actual)
5. Propiedades de estilos (`menuColors`, `menuFont`, etc.) son compartidas, no necesitan resolución por locale
