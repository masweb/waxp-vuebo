# Block resize

Redimensionar bloques mediante drag & drop sobre el handler `.blockui.resize`. Inspirado en el proyecto `waxp-handler`.

---

## Arquitectura

```
drag en .blockui.resize
  → useResizeBlock (interactjs resizable, edges: right + bottom)
    → actualiza coords reactivas en vivo (live grid snapping)
    → drawingStore.setMoveShadow() (shadow overlay del tamaño destino)
  → end: pushDown, ensureRows, findFreeCoords, trimRows
```

---

## Composable

**`src/composables/useResizeBlock.ts`**

Se invoca desde `PageBlock.vue` con el ref del elemento bloque y getters del bloque y sección.

```typescript
useResizeBlock(
  blockEl: Ref<HTMLElement | undefined>,
  block: () => Block,
  section: () => Section,
)
```

interactjs `resizable` sobre el `.block` con `allowFrom: '.blockui.resize'` y `edges: { right: true, bottom: true }`.

---

## Live grid snapping

El resize actualiza las coordenadas reactivas del bloque **en vivo** durante el drag. No se usan `transform`, `width` o `height` inline. En cada frame, el bloque se reposiciona en el grid real, el contenido fluye y se redistribuye naturalmente.

Por qué no `transform: scale()`: scale solo estira visualmente el contenido (texto, bordes, iconos), no produce redistribución real. Además distorsiona bordes y elementos UI. El live grid snapping evita estos problemas: el bloque ocupa celdas reales del grid.

Por qué no `width/height` inline: aplicados a un grid item, modifican el layout del grid y distorsionan las celdas (que tienen `aspect-ratio: 1/1` via `::before`).

### `restrictSize`

```typescript
modifiers: [
  interact.modifiers.restrictSize({
    min: { width: 1, height: 1 },
  }),
]
```

Permite que interactjs redimensione hasta el mínimo absoluto (1px), sin imponer restricciones basadas en el contenido del elemento.

---

## cellHalf — Snapping de tamaño

Igual que el move, se usa `cellHalf` para calcular las esquinas del área redimensionada:

- **Esquina superior-izquierda** (fija, solo se resizea a derecha y abajo): `+cellHalf`
- **Esquina inferior-derecha** (la que se arrastra): `-cellHalf`

```
cellHalf = cellWidth / 2
startX = rect.left - sectionRect.left + cellHalf
startY = rect.top - sectionRect.top + cellHalf
endX = rect.right - sectionRect.left - cellHalf
endY = rect.bottom - sectionRect.top - cellHalf
```

Dos llamadas a `pixelToGrid` (start y end) determinan el span del bloque:

```
newW = abs(endGrid.col - startGrid.col) + 1
newH = abs(endGrid.row - startGrid.row) + 1
```

---

## `event.rect` vs `getBoundingClientRect()`

Se usa `event.rect` de interactjs (dimensiones calculadas por interactjs a partir del rect inicial + delta del mouse) en vez de `getBoundingClientRect()` del elemento. Esto es crucial porque:

- El elemento NO cambia de tamaño en el DOM durante el drag (solo cambian sus coords reactivas del grid)
- `getBoundingClientRect()` devolvería el tamaño del grid cell, no el del resize en curso
- `event.rect` refleja fielmente la posición del mouse del usuario

---

## Ciclo de vida del resize

### `start`

1. Busca la sección ancestra via `.closest('.section')`
2. Cachea `sectionRect` (no cambia durante el resize)
3. Guarda coords originales del bloque
4. Añade clase `.block--resizing` (z-index)
5. Muestra shadow inicial con las coords originales

### `move`

1. **Throttleado con `requestAnimationFrame`**
2. Calcula nueva posición y tamaño via `pixelToGrid` con `event.rect` de interactjs
3. Actualiza directamente las coords reactivas del bloque (`block[modeKey] = { ...coords }`)
4. El grid se reposiciona de verdad, el contenido fluye
5. Expande filas de la sección si el bloque excede las actuales
6. Actualiza el shadow overlay

### `end`

1. Recalcula coords finales (misma lógica que move)
2. Ejecuta `pushDown` para resolver colisiones con bloques existentes
3. Ejecuta `ensureRows` para ajustar filas
4. Para los otros 2 modos: `findFreeCoords` busca posición libre con el nuevo w, h
5. Ejecuta `trimRows` para eliminar filas vacías
6. Limpia clase `.block--resizing` y estado

---

## CSS necesario

El bloque necesita `contain: size` + `overflow: visible` para permitir resize a 1x1:

```scss
.block {
  min-width: 0;
  min-height: 0;
  overflow: visible;
  contain: size;
}
```

- **`contain: size`** — Desacopla el tamaño intrínseco del contenido. El grid dimensiona el item puramente según `1fr`, sin importar el contenido. Sin esto, `overflow: visible` haría que el item tuviera un tamaño mínimo igual al del contenido
- **`overflow: visible`** — Permite que el contenido se muestre por fuera del bloque cuando este es más pequeño que su contenido

Ver detalles en [Block positioning → CSS](block-positioning.md).

---

## Estados CSS

| Clase | Efecto |
|---|---|
| `.block--resizing` | `z-index: 10` |

---

## Ver también

- [Block drawing](block-drawing.md) — Dibujar bloques nuevos
- [Block move](block-move.md) — Mover bloques con drag & drop
- [Block positioning](block-positioning.md) — CSS Grid, `contain: size`, `overflow: visible`
