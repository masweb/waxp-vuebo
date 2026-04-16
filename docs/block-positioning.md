# Block positioning

Los bloques se posicionan como hijos directos del CSS Grid de la sección usando `grid-column` y `grid-row` con `span`.

---

## Tipos

```typescript
interface BlockCoords {
  x: number // columna inicial (1-indexed)
  y: number // fila inicial (1-indexed)
  w: number // número de columnas que ocupa (span)
  h: number // número de filas que ocupa (span)
}

interface Block {
  id: number
  type: string
  content: string
  d: BlockCoords // desktop
  m: BlockCoords // mobile
  t: BlockCoords // tablet
}
```

Definidos en `src/types/layout.ts`.

---

## Cómo funciona

Cada sección es un `display: grid` con `gridTemplateColumns: repeat(cols, 1fr)` y `gridTemplateRows: repeat(rows, 1fr)`. Los bloques se renderizan como hijos directos de ese grid.

El composable `useBlockGrid` (`src/composables/useBlockGrid.ts`) selecciona las coordenadas correctas según el viewport activo (`d` / `m` / `t`) y calcula el estilo inline:

```
grid-column: x / span w
grid-row: y / span h
```

El viewport se obtiene de `viewportStore().mode` (`'mobile' | 'tablet' | 'desktop'`).

---

## Componentes

| Archivo | Rol |
|---|---|
| `src/types/layout.ts` | Tipos `BlockCoords`, `Block`, `Section` |
| `src/composables/useBlockGrid.ts` | Composable que devuelve `blockStyle` para un bloque |
| `src/components/editor/PageBlock.vue` | Componente que renderiza un bloque posicionado en el grid |
| `src/components/editor/PageSection.vue` | Renderiza la sección grid + sus bloques |

`PageBlock` recibe `block` y `section` como props, y usa los composables `useBlockGrid`, `useMoveBlock` y `useResizeBlock`.

---

## CSS

### Bloque

```scss
.block {
  min-width: 0;
  min-height: 0;
  overflow: visible;
  contain: size;
  position: relative;
}
```

- **`min-width: 0; min-height: 0`** — Evita que el grid item tenga un tamaño mínimo basado en su contenido (comportamiento por defecto de CSS Grid)
- **`contain: size`** — Desacopla el tamaño intrínseco del contenido del grid item. El grid lo dimensiona puramente según `1fr`, sin importar el contenido. Necesario junto con `overflow: visible` para que `min-width/min-height: 0` funcione correctamente
- **`overflow: visible`** — Permite que el contenido se muestre por fuera del bloque cuando este es más pequeño que su contenido (por ejemplo, al redimensionar a 1x1). Sin `contain: size`, `overflow: visible` haría que el grid item tuviera un tamaño mínimo igual al del contenido, impidiendo redimensionar a celdas pequeñas

### Estados durante interacción

- **`.block--moving`** — `z-index: 10; opacity: 0.7` — El bloque se hace semi-transparente durante el movimiento
- **`.block--resizing`** — `z-index: 10` — El bloque se pone por encima del resto durante el resize

### Sección

La sección usa `::before` con `aspect-ratio: 1/1` y `visibility: hidden` para forzar que las celdas del grid tengan altura cuando no hay contenido. Este pseudo-elemento ocupa la primera celda del grid y, al ser cuadrado, fuerza que todas las filas `1fr` tengan la misma altura que el ancho de una columna.
