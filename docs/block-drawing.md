# Block drawing

Sistema de dibujado de bloques mediante drag & drop sobre las secciones del grid. Inspirado en el proyecto `waxp-handler`.

---

## Arquitectura

El sistema se compone de 3 capas:

1. **`useNewBlock`** — Captura eventos de drag con `interactjs`
2. **`drawingStore`** — Estado reactivo del dibujo en curso
3. **`DrawingOverlay`** — Capa visual que muestra el área seleccionada

```
drag en sección
  → useNewBlock (interactjs)
    → drawingStore.draw() (convierte píxeles → grid coords)
      → DrawingOverlay (reacciona al store y pinta la selección)
```

---

## Conversión píxel → grid

**`src/composables/useGridConversion.ts`**

Funciones puras de matemática. No dependen de estado reactivo.

### `pixelToGrid(x, y, sectionEl, config, allowRowOverflow?) → { col, row }`

Convierte coordenadas de píxel (relativas al elemento de la sección) a índice de celda del grid (1-indexed).

Fórmula:

```
cellWidth = (sectionWidth - (cols - 1) * gap) / cols
step = cellWidth + gap
col = floor(x / step) + 1
```

Incluye corrección para posiciones que caen en los gaps entre celdas.

Cuando `allowRowOverflow = true`: usa `cellH = cellW` (celdas cuadradas, independiente del alto real del DOM) y no clampa la fila a `config.rows`. Necesario para poder dibujar más allá de las filas actuales de la sección.

### `calculateGridPosition(startX, startY, endX, endY, sectionEl, config, allowRowOverflow?) → BlockCoords`

Convierte dos puntos (inicio y fin del drag) a coordenadas de bloque en formato span:

```typescript
{
  x: min(start.col, end.col),
  y: min(start.row, end.row),
  w: abs(end.col - start.col) + 1,
  h: abs(end.row - start.row) + 1,
}
```

Cachea el `getBoundingClientRect` del section element durante 16ms (~1 frame) para evitar lecturas DOM repetidas.

---

## Store de dibujado

**`src/stores/drawingStore.ts`**

Estado reactivo:

| Campo | Tipo | Descripción |
|---|---|---|
| `isDrawing` | `boolean` | Si hay un dibujo en curso |
| `activeSectionId` | `number \| null` | ID de la sección donde se dibuja |
| `coords` | `BlockCoords \| null` | Coordenadas actuales de la selección |

Métodos:

- `draw(startX, startY, endX, endY, sectionEl, config, sectionId, allowRowOverflow?)` — Convierte píxeles a grid y actualiza el estado
- `setMoveShadow(coords, sectionId)` — Setea coords directamente sin cálculo (usado por move y resize)
- `resetDrawing()` — Limpia todo el estado

---

## Interactjs drag handler

**`src/composables/useNewBlock.ts`**

Se invoca desde `PageSection.vue` con el ref del elemento sección y un getter de los datos de la sección.

Ciclo de vida del drag:

1. **`start`** — Comprueba que `editor.mode === 'draw'`. Comprueba si el cursor cae sobre un bloque existente (`pixelToGrid` + check de solapamiento). Si es así, cancela el drag. Si no, cachea `sectionRect` y captura coordenadas iniciales
2. **`move`** — Throttleado con `requestAnimationFrame`. Llama a `drawingStore.draw(…, allowRowOverflow=true)` para actualizar la selección. Si las coordenadas exceden las filas actuales, expande la sección
3. **`end`** — Calcula posición final, crea el bloque via API (`POST /blocks/next-id`), resuelve colisiones, calcula coords para los otros modos, y limpia todo el estado

El draggable de la sección tiene `ignoreFrom: '.blockui'` para no capturar eventos sobre los controles de bloque (move, resize, config, delete), evitando conflictos con los handlers de bloque.

El throttle con rAF garantiza que el draw se ejecuta como máximo una vez por frame (60fps), sin depender de librerías externas.

---

## Colisiones

### No dibujar sobre bloques existentes

En el `start` del drag se convierte la posición del cursor a coordenadas de grid y se comprueba si cae dentro de un bloque existente. Si es así, el drag se cancela (`cancelled = true`) y no se inicia el dibujado.

### Push-down de bloques solapados

Tras insertar el nuevo bloque, `pushDown(blocks, modeKey, sourceCoords, sourceId)` recorre los bloques existentes. Si el nuevo bloque solapa con otro en X e Y, empuja el existente hacia abajo tantas filas como solape. Es recursivo en cascada (depth máximo 50) para resolver solapamientos encadenados.

### Expansión de filas

- **Durante el dibujo**: si las coordenadas del cursor exceden las filas de la sección, se añaden filas automáticamente (via `allowRowOverflow` en `pixelToGrid`)
- **Tras inserción**: `ensureRows(section, mode)` ajusta las filas al mínimo necesario
- **Trim**: `trimRows(section)` recorre los 3 modos y ajusta las filas al `max(y + h)` de los bloques, eliminando filas vacías por debajo

### Posicionamiento en otros modos

Para los modos que no se están dibujando, `findFreeCoords(section, mode, w, h)` busca la primera posición libre (x=1, y ascendente) donde el bloque quepa sin solapar. Si no hay espacio, expande las filas y lo coloca al final.

---

## Modo de edición

**`src/stores/editorStore.ts`**

Store con `mode: 'draw' | 'edit'`. El draw solo funciona en modo `'draw'`. El move y resize funcionan independientemente del modo (los handlers `.blockui.move` y `.blockui.resize` son interacciones explícitas).

---

## Overlay visual

**`src/components/editor/DrawingOverlay.vue`**

Capa absoluta (`position: absolute; inset: 0`) con el mismo grid template que la sección. Se posiciona encima de los bloques pero debajo del canvas de grid lines.

Se activa cuando `drawingStore.activeSectionId === section.id`, mostrando un div semi-transparente posicionado con `grid-column` / `grid-row` en el área seleccionada. Se usa tanto para dibujar como para move y resize (shadow de la posición/tamaño destino).

---

## Archivos

| Archivo | Rol |
|---|---|
| `src/composables/useGridConversion.ts` | Conversión píxel → grid, colisiones, push-down, trim |
| `src/stores/drawingStore.ts` | Estado reactivo del dibujo/move/resize |
| `src/stores/editorStore.ts` | Modo de edición (draw/edit) |
| `src/composables/useNewBlock.ts` | Handler de drag con interactjs, creación de bloques |
| `src/composables/useMoveBlock.ts` | Handler de move con interactjs, cellHalf |
| `src/composables/useResizeBlock.ts` | Handler de resize con interactjs, live grid snapping |
| `src/components/editor/DrawingOverlay.vue` | Preview visual de la selección |
| `src/types/layout.ts` | Tipos `BlockCoords`, `Block`, `Section`, `MODE_KEY` |

---

## Ver también

- [Block positioning](block-positioning.md) — CSS Grid, `contain: size`, overlay
- [Block move](block-move.md) — Mover bloques con drag & drop
- [Block resize](block-resize.md) — Redimensionar bloques con live grid snapping
