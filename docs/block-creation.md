# Block creation

Flujo completo de creación de bloques: desde el dibujado hasta la renderización y configuración por tipo.

---

## Tipos de bloque

**`src/stores/editorStore.ts`**

```typescript
type BlockType = 'Text' | 'Image' | 'Space' | 'DarkMode' | 'LanguageSwitcher'
```

| Tipo | Descripción | Propiedades propias | Usa `locales` |
|---|---|---|---|
| `Text` | Bloque de texto rico (Tiptap) | `color`, `darkColor`, `fontSize`, `lineHeight` | Sí (`text`) |
| `Image` | Bloque de imagen (fondo restringido a modo imagen) | — | No |
| `Space` | Espaciador con línea divisoria opcional | `divider` | No |
| `DarkMode` | Toggle de modo claro/oscuro | `color`, `darkColor`, `fontSize` | No |
| `LanguageSwitcher` | Selector de idioma (navega a la raíz del locale) | — | No |

---

## Estructura del tipo Block

**`src/types/layout.ts`**

```typescript
interface Block {
  id: number
  type: string
  locales?: Record<string, string>  // campos traducibles, resueltos por el backend
  d: BlockCoords     // desktop
  m: BlockCoords     // mobile
  t: BlockCoords     // tablet
  style: BlockStyle  // fondo, borde, padding, hideOn

  // Props compartidas (Text, DarkMode, futuros bloques con tamaño configurable)
  color?: null | string
  darkColor?: null | string
  fontSize?: null | number
  lineHeight?: null | number

  // Props de Space
  divider?: SideBorder
}
```

- `d`, `m`, `t` son coordenadas independientes por viewport (desktop, mobile, tablet)
- `style` es compartido por todos los tipos (fondo, borde, padding)
- Las propiedades propias son opcionales (`?`) y solo se inicializan para su tipo correspondiente
- `locales` es opcional: solo los bloques con contenido traducible lo usan

### BlockCoords

```typescript
interface BlockCoords {
  x: number  // columna inicio (1-indexed)
  y: number  // fila inicio (1-indexed)
  w: number  // ancho en celdas
  h: number  // alto en celdas
}
```

### SideBorder (divider)

```typescript
interface SideBorder {
  active: boolean
  color: string
  thick: string
  mode: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none'
}
```

---

## Sistema de idiomas (locales)

### Arquitectura

El sistema multilenguaje se basa en que **el backend resuelve los locales**. El frontend nunca carga contenido de todos los idiomas, solo del idioma activo.

```
Frontend (editor)                     Backend
─────────────────                     ───────
GET /api/pages/:id?locale=es    →    Devuelve blocks con locales resueltos:
                                     { "locales": { "text": "Hola" } }
                                     (strings planos, no mapas)

PUT /api/pages/:id?locale=es    →    Mergea strings en el mapa existente:
body: { "locales": { "text": "Hola editado" } }
                                     BD: { "text": { "es": "Hola editado", "en": "Hello" } }
```

### Flujo de datos

1. El router registra rutas por locale (`es-18`, `en-18`)
2. Cada ruta pasa `locale` como prop a `RouterContent`
3. `RouterContent` llama `getPage(pageId, locale)` → la API devuelve bloques con `locales` resueltos
4. Los bloques leen `block.locales.text` directamente (string plano)
5. Al guardar, `updatePage(locale)` → el backend mergea solo ese locale
6. Al cambiar idioma (LanguageSwitcher): se navega a la ruta del nuevo locale, se recarga página + site

### Block.locales — campos por tipo

Cada tipo de bloque define qué claves tiene `locales`. Por defecto `locales` es `undefined` (no traducible).

| Tipo | `locales` | Ejemplo |
|---|---|---|
| `Text` | `{ text: string }` | `{ "text": "Bienvenidos" }` |
| `Image` | `undefined` | — |
| `Space` | `undefined` | — |
| `DarkMode` | `undefined` | — |
| `LanguageSwitcher` | `undefined` | — |
| `Button` (futuro) | `{ label: string }` | `{ "label": "Comprar" }` |
| `Card` (futuro) | `{ title: string, description: string }` | `{ "title": "Producto", "description": "Detalle" }` |

Un bloque puede tener múltiples campos en `locales` (título + descripción, etc.).

### Almacenamiento en BD vs respuesta API

**En la base de datos** (backend), `locales` es un mapa anidado:

```json
{
  "locales": {
    "text": { "es": "Hola", "en": "Hello" }
  }
}
```

**En la respuesta API** (con `?locale=es`), se resuelve a strings planos:

```json
{
  "locales": {
    "text": "Hola"
  }
}
```

Si un locale no tiene traducción, se devuelve `""`.

### Site: header y footer

El site tiene `options.header` y `options.footer` como secciones con bloques. Estos bloques también usan `locales`:

- `GET /api/sites/:id` → devuelve header/footer resueltos con el locale por defecto
- `GET /api/sites/:id?locale=en` → devuelve header/footer resueltos en inglés
- `PUT /api/sites/:id?locale=es` → mergea los locales de header/footer para español

`siteStore.loadSiteForLocale(locale)` se llama al cambiar de idioma para actualizar header/footer sin duplicar peticiones (usa `loadedLocale` para evitar fetch redundante).

### pageStore.currentLocale

El locale actual se almacena en `pageStore().currentLocale`. Se establece en `getPage(pageId, locale)` y lo usan:

- `MainBar` → `updatePage(currentLocale)` y `updateSite(currentLocale)`
- `LanguageSwitcher` → valor seleccionado del `<select>`
- `Text` → TipTap lee/escribe `block.locales.text` (no necesita saber el locale, ya viene resuelto)

---

## Propiedades compartidas: tamaño y color responsive

`color`, `darkColor` y `fontSize` no son exclusivas de Text. Cualquier bloque que necesite tamaño configurable con comportamiento responsive las usa (Text, DarkMode, y futuros bloques).

### Cadena de herencia

```
Propiedad del bloque (ej. fontSize = 1.5)
  ↓ si es null
Propiedad del site (ej. site.options.fontSize = 1)
  ↓ si no existe
Valor hardcodeado (ej. 1 para fontSize, 24px para iconos)
```

En los settings se muestra un badge "Heredado" cuando la propiedad del bloque es `null`. El usuario puede resetear al valor heredado con el botón ✕.

### Cálculo responsive — `useBlockGrid`

**`src/composables/useBlockGrid.ts`** → `blockFontStyle`

El tamaño base (`fontSize`, ya sea del bloque o heredado del site) se transforma en píxeles según el viewport y las dimensiones de la sección:

| Condición | Fórmula | Notas |
|---|---|---|
| Desktop + fullWidth | `(fontSize + factor) * viewportWidth / 100` px | `factor = 1.491 - 0.000965 * sectionWidth` |
| Desktop + maxWidth | `(fontSize + factor) * effectiveWidth / 100` px | `effectiveWidth = forcedMode ? maxWidth : viewportWidth` |
| Tablet | `(fontSize + 0.933) * effectiveWidth / 100` px | `effectiveWidth = forcedMode ? 820 : viewportWidth` |
| Mobile | `(fontSize + 3) * effectiveWidth / 100` px | `effectiveWidth = forcedMode ? 480 : viewportWidth` |
| Fallback | `fontSize` em | Cuando no hay contexto de sección |

El factor de desktop decrece con el ancho de sección: a secciones más anchas, el tamaño crece menos por unidad de `fontSize`.

### `textStyle` — salida final

```typescript
const textStyle = computed(() => {
  const color = isDark ? block.darkColor : block.color
  // color se incluye solo si no es null/undefined
  // fontSize se incluye con el cálculo responsive solo si block.fontSize != null
  // lineHeight se incluye con cálculo responsive solo si block.lineHeight != null
})
```

### Uso por tipo de bloque

| Bloque | Usa `textStyle` para | Notas |
|---|---|---|
| **Text** | Aplica directamente al wrapper del texto (`font-size`, `color`, `line-height`) | Todo el contenido TipTap hereda los estilos |
| **DarkMode** | Extrae `font-size` → píxeles para `IconSunFilled`/`IconMoonFilled` `size`. Extrae `color` para el icono. Si no hay color en el bloque, hereda de `site.options.lightColor`/`darkColor` | No usa `line-height` |
| **LanguageSwitcher** | Aplica al `<select>` de idioma | Hereda color y fuente del bloque |

### Cómo consumir `textStyle` en un nuevo bloque

**Para texto** (como Text): aplica `textStyle` directamente a un wrapper:

```vue
<div :style="textStyle">
  <!-- contenido -->
</div>
```

**Para iconos** (como DarkMode): extrae `font-size` para calcular píxeles:

```typescript
const iconSize = computed(() => {
  const fs = textStyle.value?.['font-size']
  if (fs?.endsWith('px')) return parseFloat(fs)
  if (fs?.endsWith('em')) return Math.round(parseFloat(fs) * 16)
  return (site.options.fontSize ?? 1) * 24  // fallback
})
```

**Para color con herencia del site**: cuando el bloque no tiene color, usar el del site:

```typescript
const iconColor = computed(() => {
  if (textStyle.value?.['color']) return textStyle.value['color']
  return isDark.value ? site.options.darkColor : site.options.lightColor
})
```

---

## Flujo de creación

```
Usuario dibuja en sección (useNewBlock)
  → Selecciona área del grid (DrawingOverlay)
  → Suelta el mouse (onEnd)
    → editorStore.requestBlockType()
      → Abre ModalNewBlock.vue (Promise)
    → Usuario elige tipo (Text / Image / Space / DarkMode / LanguageSwitcher)
      → editorStore.selectBlockType(type) (resuelve Promise)
    → POST /api/sites/{id}/blocks/next-id (obtiene ID)
    → Se construye el objeto Block con defaults
    → Se inserta en section.blocks
    → pushDown → ensureRows → findFreeCoords → trimRows
```

### 1. Selección de tipo (modal)

**`src/stores/editorStore.ts`**

El modal funciona con un patrón Promise:

```typescript
requestBlockType(): Promise<BlockType>
  // Abre el modal y devuelve una Promise

selectBlockType(type: BlockType)
  // Cierra el modal y resuelve la Promise con el tipo elegido
```

**`src/components/editor/ModalNewBlock.vue`**

Muestra 5 botones (Texto, Imagen, Espacio, Modo oscuro, Idioma) con iconos de Tabler Icons. Al pulsar uno, llama a `selectBlockType(type)`.

### 2. Inicialización del objeto Block

**`src/composables/useNewBlock.ts`** → `onEnd`

El objeto se construye con valores por defecto y se extiende según el tipo:

```typescript
const block: Block = {
  id: resp.id,
  type: blockType,
  d: { x: 1, y: 1, w: 1, h: 1 },
  m: { x: 1, y: 1, w: 1, h: 1 },
  t: { x: 1, y: 1, w: 1, h: 1 },

  // Extensión por tipo
  ...(blockType === 'Text'
    ? { locales: { text: '' }, color: null, darkColor: null, fontSize: null, lineHeight: null }
    : {}),
  ...(blockType === 'Space'
    ? { divider: { active: false, color: '#cccccc', thick: '1', mode: 'solid' } }
    : {}),
  ...(blockType === 'DarkMode'
    ? { color: null, darkColor: null, fontSize: null }
    : {}),

  style: { /* fondo, borde, padding con defaults */ }
}
```

- Los bloques traducibles (Text) inicializan `locales` con claves vacías
- Los bloques no traducibles (Image, Space, DarkMode, LanguageSwitcher) no llevan `locales`
- Las propiedades propias de cada tipo se añaden mediante spread condicional

### 3. Colocación en el grid

```
block[modeKey] = drawnCoords          // coords del dibujado en el modo activo
pushDown(sec.blocks, ...)             // empuja bloques solapados hacia abajo
ensureRows(sec, mode)                 // ajusta filas al mínimo
findFreeCoords(sec, mode, w, h)       // busca posición libre en los otros 2 modos
trimRows(sec)                         // elimina filas vacías en los 3 modos
```

---

## Arquitectura de renderizado

### Dispatcher de bloques

**`src/components/editor/PageBlock.vue`**

Recibe `block` y `section` como props y despacha al componente correspondiente según `block.type`:

```vue
<script setup lang="ts">
const blockComponents: Record<string, Component> = {
  Text: defineAsyncComponent(() => import('./blocks/Text.vue')),
  Image: defineAsyncComponent(() => import('./blocks/Image.vue')),
  Space: defineAsyncComponent(() => import('./blocks/Space.vue')),
  DarkMode: defineAsyncComponent(() => import('./blocks/DarkMode.vue')),
  LanguageSwitcher: defineAsyncComponent(() => import('./blocks/LanguageSwitcher.vue'))
}

const blockComponent = computed(() => blockComponents[props.block.type])
</script>

<template>
  <component :is="blockComponent" :block="block" :section="section" />
</template>
```

Carga perezosa con `defineAsyncComponent` para que cada tipo solo se cargue cuando se necesita.

### Composable base

**`src/composables/useBlockBase.ts`**

Lógica compartida por todos los bloques:

```typescript
const { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu } =
  useBlockBase(() => props.block, () => props.section)
```

Internamente:

| Función | Descripción |
|---|---|
| `useBlockGrid` | Calcula `blockStyle` (grid-column/row + fondo), `backgroundStyle` (overlay), `textStyle` (color + fontSize responsive) |
| `useMoveBlock` | Inicializa drag & drop para mover |
| `useResizeBlock` | Inicializa resize por esquina inferior-derecha |
| `onContextMenu` | Menú contextual con "Configurar" y "Eliminar" |

### Componentes por tipo

| Archivo | Tipo | Funcionalidad |
|---|---|---|
| `blocks/Text.vue` | Text | Editor TipTap, doble-click para editar, color/fuente responsive. Lee `block.locales.text` |
| `blocks/Image.vue` | Image | Fondo restringido a modo imagen (`BackgroundSettings` con `allowedModes="['image']"`) |
| `blocks/Space.vue` | Space | Línea divisoria opcional centrada verticalmente |
| `blocks/DarkMode.vue` | DarkMode | Toggle `site.options.darkMode`, icono sol/luna con tamaño y color configurable |
| `blocks/LanguageSwitcher.vue` | LanguageSwitcher | `<select>` con idiomas del site, navega a la raíz del locale seleccionado |

### Text — Contenido multilenguaje

**`src/components/editor/blocks/Text.vue`**

El bloque Text muestra y edita `block.locales.text`:

```typescript
const localizedContent = computed(() => props.block.locales?.text || '')
```

**Lectura**: Muestra `block.locales.text` (string plano ya resuelto por el backend para el locale actual).

**Escritura** (`useTipTap`): El editor TipTap lee/escribe directamente en `block.locales.text`:

```typescript
// activate (abrir editor)
editor.commands.setContent(block.locales?.text || '')

// flush (guardar cambios)
if (!block.locales) block.locales = {}
block.locales.text = editor.getHTML()
```

**Guardado**: Al pulsar el botón de guardar, `updatePage(locale)` envía el layout completo. El backend mergea `locales.text` solo para el locale indicado en `?locale=`, preservando los demás idiomas intactos.

### LanguageSwitcher — Cambio de idioma

**`src/components/editor/blocks/LanguageSwitcher.vue`**

Renderiza un `<select>` con los idiomas configurados en `site.locales`. Al cambiar:

1. **Sin cambios sin guardar** (`historyStore.canUndo === false`): navega directamente
2. **Con cambios sin guardar**: muestra modal con 3 opciones:
   - **Guardar** → `updatePage(locale)` + `updateSite(locale)` → navega al nuevo locale
   - **No guardar** → navega sin guardar (los cambios se pierden al recargar)
   - **Cancelar** → cierra el modal, no hace nada

La navegación busca la ruta raíz del locale destino (`/` para el locale por defecto, `/{code}` para el resto) usando `site.routes`.

Usa `<Teleport to="body">` para el modal de confirmación, evitando problemas con el CSS Grid.

### Space — Línea divisoria

**`src/components/editor/blocks/Space.vue`**

Renderiza una línea horizontal centrada cuando `block.divider.active` es `true`:

```vue
<div v-if="dividerStyle" class="space-divider" :style="dividerStyle" />
```

```typescript
const dividerStyle = computed(() => {
  const d = props.block.divider
  if (!d?.active) return null
  return { borderTop: `${d.thick}px ${d.mode} ${d.color}` }
})
```

El `.space-divider` se posiciona con `position: absolute; top: 50%; transform: translateY(-50%)` centrado verticalmente, sin interferir con el resize handle.

### DarkMode — Toggle de tema

**`src/components/editor/blocks/DarkMode.vue`**

Botón centrado en el bloque que alterna `siteStore().site.options.darkMode`:

- Muestra `IconSunFilled` en modo claro, `IconMoonFilled` en modo oscuro
- El tamaño del icono pasa por `textStyle.font-size` (cálculos responsive de `useBlockGrid`)
- El color hereda del site (`lightColor`/`darkColor`) cuando el bloque no tiene color propio

### Image — Fondo restringido

`BackgroundSettings` acepta una prop `allowedModes` para restringir los modos disponibles. Para Image, BlockSettings pasa `allowedModes="['image']"`, lo que fuerza el modo imagen y oculta el selector de modos.

```vue
<!-- BlockSettings.vue -->
<BackgroundSettings
  :background="activeBlock.style.background"
  :allowedModes="bgAllowedModes"
  @update="onBackgroundUpdate"
/>
```

---

## Arquitectura del panel de opciones

### Dispatcher de settings

**`src/components/editor/settings/BlockSettings.vue`**

Carga dinámicamente el componente de ajustes según el tipo de bloque, igual que `PageBlock.vue`:

```vue
<script setup lang="ts">
const settingsComponents: Record<string, Component> = {
  Text: defineAsyncComponent(() => import('./blocks/TextSettings.vue')),
  Space: defineAsyncComponent(() => import('./blocks/SpaceSettings.vue')),
  DarkMode: defineAsyncComponent(() => import('./blocks/DarkModeSettings.vue'))
}

const settingsComponent = computed(() => settingsComponents[activeBlock.value?.type ?? ''])
</script>

<template>
  <!-- Tipo de bloque -->
  <div class="mb-3">...</div>

  <!-- Settings específicos del tipo -->
  <component :is="settingsComponent" />

  <!-- Settings comunes: fondo + coordenadas -->
  <BackgroundSettings ... />
  <table>...</table>
</template>
```

El panel se estructura en 3 zonas:

1. **Cabecera** — Tipo de bloque (siempre visible)
2. **Settings por tipo** — Componente dinámico (`TextSettings`, `SpaceSettings`, `DarkModeSettings`)
3. **Settings comunes** — Fondo (`BackgroundSettings`, con modos restringidos para Image) + coordenadas por viewport

### Componentes de settings por tipo

| Archivo | Tipo | Opciones |
|---|---|---|
| `settings/blocks/TextSettings.vue` | Text | Color claro/oscuro, tamaño de fuente, altura de línea |
| `settings/blocks/SpaceSettings.vue` | Space | Toggle de línea, color, grosor, estilo de borde |
| `settings/blocks/DarkModeSettings.vue` | DarkMode | Color claro/oscuro, tamaño de fuente |

Todos acceden a `activeBlock` desde `pageStore()` directamente (no reciben props). Mutan el bloque con `historyStore().snapshot()` antes de cada cambio.

### SpaceSettings — Controles del divider

```
☑ Línea divisoria
  ├── Color (ColorPicker)
  ├── Grosor (NumberRange, 1-20px)
  └── Estilo (select: solid, dashed, dotted, double, groove, ridge, inset, outset)
```

El toggle inicializa el objeto `divider` si no existe (compatibilidad con bloques existentes creados antes de la propiedad).

---

## Añadir un nuevo tipo de bloque

### Checklist

1. **Tipo** — Añadir a `BlockType` en `editorStore.ts`
2. **Interfaz** — Añadir propiedades propias opcionales a `Block` en `layout.ts` (si necesita)
3. **Locales** — Definir qué claves tendrá `locales` (si el bloque tiene contenido traducible)
4. **Modal** — Añadir botón en `ModalNewBlock.vue`
5. **Inicialización** — Añadir spread condicional en `useNewBlock.ts` `onEnd`
6. **Componente** — Crear `blocks/{Tipo}.vue` con `useBlockBase`
7. **Dispatcher** — Registrar en `PageBlock.vue` `blockComponents`
8. **Settings** — Crear `settings/blocks/{Tipo}Settings.vue`
9. **Dispatcher settings** — Registrar en `BlockSettings.vue` `settingsComponents`
10. **i18n** — Añadir claves en `es.json` y `en.json`

### Si el bloque necesita tamaño/color configurable

Reutilizar `color`, `darkColor`, `fontSize` (ya existentes en `Block`):

1. **Inicialización** — Añadir `{ color: null, darkColor: null, fontSize: null }` en el spread
2. **Componente** — Consumir `textStyle` de `useBlockBase` para tamaño responsive y color
3. **Settings** — Color light/dark (ColorPicker) + fontSize (NumberRange con badge "Heredado" y reset)
4. No hace falta modificar `Block` en `layout.ts` ni `useBlockGrid.ts`

### Si el bloque tiene contenido traducible

1. **Inicialización** — Añadir `{ locales: { text: '' } }` (o las claves que necesite) en el spread
2. **Componente** — Leer `block.locales.text` para mostrar, escribir en `block.locales.text` al editar
3. El backend se encarga del mergeo por locale — no hay lógica de idiomas en el bloque
4. Para múltiples campos: `{ locales: { title: '', description: '' } }`

### Ejemplo: añadir tipo "Button"

```typescript
// 1. editorStore.ts
export type BlockType = 'Text' | 'Image' | 'Space' | 'DarkMode' | 'LanguageSwitcher' | 'Button'

// 2. layout.ts — solo si necesita props propias nuevas
btnColor?: null | string

// 3. useNewBlock.ts — añadir spread
...(blockType === 'Button'
  ? { locales: { label: '' }, color: null, darkColor: null, fontSize: null }
  : {}),

// 4. ModalNewBlock.vue — añadir botón
<button @click="pick('Button')">...</button>

// 5. blocks/Button.vue — leer locales
const label = computed(() => props.block.locales?.label || '')

// 6. PageBlock.vue
Button: defineAsyncComponent(() => import('./blocks/Button.vue'))

// 7. settings/blocks/ButtonSettings.vue — color + fontSize + label

// 8. BlockSettings.vue
Button: defineAsyncComponent(() => import('./blocks/ButtonSettings.vue'))
```

---

## Archivos

| Archivo | Rol |
|---|---|
| `src/types/layout.ts` | Tipos `Block`, `BlockCoords`, `SideBorder`, `MODE_KEY` |
| `src/stores/editorStore.ts` | `BlockType`, modal de selección, modo editor |
| `src/stores/pageStore.ts` | `currentLocale`, `getPage(id, locale)`, `updatePage(locale)` |
| `src/stores/siteStore.ts` | `loadedLocale`, `loadSiteForLocale(locale)`, `updateSite(locale)` |
| `src/composables/useNewBlock.ts` | Drag handler, creación del objeto Block, colocación |
| `src/composables/useBlockBase.ts` | Lógica compartida (grid, move, resize, context menu) |
| `src/composables/useBlockGrid.ts` | Cálculo de estilos (grid position, fondo, texto responsive) |
| `src/composables/useTipTap.ts` | Editor TipTap singleton, lee/escribe `block.locales.text` |
| `src/components/editor/ModalNewBlock.vue` | Modal de selección de tipo |
| `src/components/editor/PageBlock.vue` | Dispatcher de componentes de bloque |
| `src/components/editor/RouterContent.vue` | Carga página + site para el locale activo |
| `src/components/editor/blocks/Text.vue` | Bloque Text (TipTap + `locales.text`) |
| `src/components/editor/blocks/Image.vue` | Bloque Image |
| `src/components/editor/blocks/Space.vue` | Bloque Space |
| `src/components/editor/blocks/DarkMode.vue` | Bloque DarkMode |
| `src/components/editor/blocks/LanguageSwitcher.vue` | Bloque LanguageSwitcher (select + modal confirmación) |
| `src/components/editor/settings/BlockSettings.vue` | Panel de opciones (dispatcher por tipo) |
| `src/components/editor/settings/blocks/TextSettings.vue` | Opciones de Text |
| `src/components/editor/settings/blocks/SpaceSettings.vue` | Opciones de Space (divider) |
| `src/components/editor/settings/blocks/DarkModeSettings.vue` | Opciones de DarkMode |
| `src/components/editor/settings/fields/BackgroundSettings.vue` | Fondo con modos (acepta `allowedModes`) |

---

## Ver también

- [Block drawing](block-drawing.md) — Dibujado de bloques con drag & drop
- [Block move](block-move.md) — Mover bloques
- [Block resize](block-resize.md) — Redimensionar bloques
- [Block positioning](block-positioning.md) — CSS Grid, `contain: size`, overlay
