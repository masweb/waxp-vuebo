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

---

## CSS

Los bloques necesitan `min-width: 0; min-height: 0; overflow: hidden;` para comportarse correctamente dentro del CSS Grid (evitar overflow por defecto de grid items).

La sección usa `::before` con `aspect-ratio: 1/1` y `visibility: hidden` para forzar que las celdas del grid tengan altura cuando no hay contenido.
