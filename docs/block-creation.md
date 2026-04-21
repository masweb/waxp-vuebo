# Block creation

Flujo completo de creación de bloques: desde el dibujado hasta la renderización y configuración por tipo.

---

## Tipos de bloque

**`src/stores/editorStore.ts`**

```typescript
type BlockType = 'Text' | 'Image' | 'Space'
```

| Tipo | Descripción | Propiedades propias |
|---|---|---|
| `Text` | Bloque de texto rico (Tiptap) | `color`, `darkColor`, `fontSize`, `lineHeight` |
| `Image` | Bloque de imagen | — (placeholder) |
| `Space` | Espaciador con línea divisoria opcional | `divider` |

---

## Estructura del tipo Block

**`src/types/layout.ts`**

```typescript
interface Block {
  id: number
  type: string
  content: string
  d: BlockCoords     // desktop
  m: BlockCoords     // mobile
  t: BlockCoords     // tablet
  style: BlockStyle  // fondo, borde, padding, hideOn

  // Props de Text
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

## Flujo de creación

```
Usuario dibuja en sección (useNewBlock)
  → Selecciona área del grid (DrawingOverlay)
  → Suelta el mouse (onEnd)
    → editorStore.requestBlockType()
      → Abre ModalNewBlock.vue (Promise)
    → Usuario elige tipo (Text / Image / Space)
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

Muestra 3 botones (Texto, Imagen, Espacio) con iconos de Tabler Icons. Al pulsar uno, llama a `selectBlockType(type)`.

### 2. Inicialización del objeto Block

**`src/composables/useNewBlock.ts`** → `onEnd`

El objeto se construye con valores por defecto y se extiende según el tipo:

```typescript
const block: Block = {
  id: resp.id,
  type: blockType,
  content: 'Escribe aquí ...',
  d: { x: 1, y: 1, w: 1, h: 1 },
  m: { x: 1, y: 1, w: 1, h: 1 },
  t: { x: 1, y: 1, w: 1, h: 1 },

  // Extensión por tipo
  ...(blockType === 'Text'
    ? { color: null, darkColor: null, fontSize: null, lineHeight: null }
    : {}),
  ...(blockType === 'Space'
    ? { divider: { active: false, color: '#cccccc', thick: '1', mode: 'solid' } }
    : {}),

  style: { /* fondo, borde, padding con defaults */ }
}
```

Las propiedades propias de cada tipo se añaden mediante spread condicional. Los otros tipos (ej. `Image`) no reciben propiedades extra.

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
  Space: defineAsyncComponent(() => import('./blocks/Space.vue'))
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
| `useBlockGrid` | Calcula `blockStyle` (grid-column/row + fondo), `backgroundStyle` (overlay), `textStyle` (color + fontSize) |
| `useMoveBlock` | Inicializa drag & drop para mover |
| `useResizeBlock` | Inicializa resize por esquina inferior-derecha |
| `onContextMenu` | Menú contextual con "Configurar" y "Eliminar" |

### Componentes por tipo

| Archivo | Tipo | Funcionalidad |
|---|---|---|
| `blocks/Text.vue` | Text | Editor TipTap, doble-click para editar, color/fuente responsive |
| `blocks/Image.vue` | Image | Placeholder (mismo esquema base que Space) |
| `blocks/Space.vue` | Space | Línea divisoria opcional centrada verticalmente |

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

---

## Arquitectura del panel de opciones

### Dispatcher de settings

**`src/components/editor/settings/BlockSettings.vue`**

Carga dinámicamente el componente de ajustes según el tipo de bloque, igual que `PageBlock.vue`:

```vue
<script setup lang="ts">
const settingsComponents: Record<string, Component> = {
  Text: defineAsyncComponent(() => import('./blocks/TextSettings.vue')),
  Space: defineAsyncComponent(() => import('./blocks/SpaceSettings.vue'))
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
2. **Settings por tipo** — Componente dinámico (`TextSettings`, `SpaceSettings`)
3. **Settings comunes** — Fondo (`BackgroundSettings`) + coordenadas por viewport

### Componentes de settings por tipo

| Archivo | Tipo | Opciones |
|---|---|---|
| `settings/blocks/TextSettings.vue` | Text | Color claro/oscuro, tamaño de fuente, altura de línea |
| `settings/blocks/SpaceSettings.vue` | Space | Toggle de línea, color, grosor, estilo de borde |

Ambos componentes acceden a `activeBlock` desde `pageStore()` directamente (no reciben props). Mutan el bloque con `historyStore().snapshot()` antes de cada cambio.

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
2. **Interfaz** — Añadir propiedades propias opcionales a `Block` en `layout.ts`
3. **Modal** — Añadir botón en `ModalNewBlock.vue`
4. **Inicialización** — Añadir spread condicional en `useNewBlock.ts` `onEnd`
5. **Componente** — Crear `blocks/{Tipo}.vue` con `useBlockBase`
6. **Dispatcher** — Registrar en `PageBlock.vue` `blockComponents`
7. **Settings** — Crear `settings/blocks/{Tipo}Settings.vue`
8. **Dispatcher settings** — Registrar en `BlockSettings.vue` `settingsComponents`
9. **i18n** — Añadir claves en `es.json` y `en.json`

### Ejemplo: añadir tipo "Button"

```typescript
// 1. editorStore.ts
export type BlockType = 'Text' | 'Image' | 'Space' | 'Button'

// 2. layout.ts — añadir al interface Block
btnColor?: null | string
btnLabel?: null | string

// 3. ModalNewBlock.vue — añadir botón
<button @click="pick('Button')">...</button>

// 4. useNewBlock.ts — añadir spread
...(blockType === 'Button' ? { btnColor: null, btnLabel: null } : {}),

// 5. blocks/Button.vue — usar useBlockBase
const { blockRef, blockStyle, backgroundStyle, onContextMenu } = useBlockBase(...)

// 6. PageBlock.vue
Button: defineAsyncComponent(() => import('./blocks/Button.vue'))

// 7. settings/blocks/ButtonSettings.vue — opciones propias

// 8. BlockSettings.vue
Button: defineAsyncComponent(() => import('./blocks/ButtonSettings.vue'))
```

---

## Archivos

| Archivo | Rol |
|---|---|
| `src/types/layout.ts` | Tipos `Block`, `BlockCoords`, `SideBorder`, `MODE_KEY` |
| `src/stores/editorStore.ts` | `BlockType`, modal de selección, modo editor |
| `src/composables/useNewBlock.ts` | Drag handler, creación del objeto Block, colocación |
| `src/composables/useBlockBase.ts` | Lógica compartida (grid, move, resize, context menu) |
| `src/composables/useBlockGrid.ts` | Cálculo de estilos (grid position, fondo, texto) |
| `src/components/editor/ModalNewBlock.vue` | Modal de selección de tipo |
| `src/components/editor/PageBlock.vue` | Dispatcher de componentes de bloque |
| `src/components/editor/blocks/Text.vue` | Bloque Text |
| `src/components/editor/blocks/Image.vue` | Bloque Image |
| `src/components/editor/blocks/Space.vue` | Bloque Space |
| `src/components/editor/settings/BlockSettings.vue` | Panel de opciones (dispatcher por tipo) |
| `src/components/editor/settings/blocks/TextSettings.vue` | Opciones de Text |
| `src/components/editor/settings/blocks/SpaceSettings.vue` | Opciones de Space (divider) |

---

## Ver también

- [Block drawing](block-drawing.md) — Dibujado de bloques con drag & drop
- [Block move](block-move.md) — Mover bloques
- [Block resize](block-resize.md) — Redimensionar bloques
- [Block positioning](block-positioning.md) — CSS Grid, `contain: size`, overlay
