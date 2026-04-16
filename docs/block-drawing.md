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
- `resetDrawing()` — Limpia todo el estado

---

## Interactjs drag handler

**`src/composables/useNewBlock.ts`**

Se invoca desde `PageSection.vue` con el ref del elemento sección y un getter de los datos de la sección.

Ciclo de vida del drag:

1. **`start`** — Comprueba si el cursor cae sobre un bloque existente (`pixelToGrid` + check de solapamiento). Si es así, cancela el drag. Si no, cachea `sectionRect` y captura coordenadas iniciales
2. **`move`** — Throttleado con `requestAnimationFrame`. Llama a `drawingStore.draw(…, allowRowOverflow=true)` para actualizar la selección. Si las coordenadas exceden las filas actuales, expande la sección
3. **`end`** — Calcula posición final, crea el bloque via API (`POST /blocks/next-id`), resuelve colisiones, calcula coords para los otros modos, y limpia todo el estado

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

## Siguientes pasos: mover y redimensionar

### Mover bloques (`useMoveBlock`)

- interactjs sobre los `.block` (no sobre la sección). **Importante**: actualmente el drag de `useNewBlock` está sobre la sección entera. Al añadir drag sobre bloques habrá que evitar conflictos (interactjs usa `event.target` para distinguir, pero hay que verificar que los eventos no se propaguen)
- El bloque movido debe checkear colisiones igual que el dibujado: `pushDown` si solapa con otro, `ensureRows` para expandir, `trimRows` al finalizar
- Actualizar las coords del modo activo directamente en el bloque reactivo (`block[modeKey].x = newX`, etc.)
- Para los otros 2 modos: re-calcular con `findFreeCoords` o mantener posición proporcional

### Redimensionar bloques (`useResizeBlock`)

- interactjs con `resizable()` sobre los `.block`. Añadir handles visuales (esquinas/bordes)
- Conversión de píxeles → grid igual que el dibujado: usar `pixelToGrid` para convertir el tamaño final del drag
- Mismo sistema de colisiones: `pushDown` para bloques solapados por el resize
- Clamping: el bloque no puede ser más pequeño que 1x1 ni más grande que el grid
- Actualizar solo `w` y `h` del modo activo, recalcular otros modos

### Composable de colisiones reutilizable

Las funciones `pushDown`, `ensureRows`, `trimRows`, `rectsOverlap`, `findFreeCoords` ya son genéricas y están en `useGridConversion`. Mover y redimensionar pueden reutilizarlas directamente.

### Store de interacción

Actualmente `drawingStore` es específico del dibujado. Para mover/redimensionar se puede:
- Reutilizar `drawingStore` renombrándolo a algo genérico (ej: `interactionStore`)
- O crear stores separados con una interfaz común

### Modo de edición

El flujo futuro será: el usuario puede estar en modo "dibujar" o en modo "editar". En modo dibujar, el drag sobre la sección crea bloques. En modo editar, el drag sobre bloques los mueve/redimensiona. Esto requerirá un flag en un store (ej: `editorMode: 'draw' | 'edit'`) y condicionar los listeners de interactjs.

---

## Overlay visual

**`src/components/editor/DrawingOverlay.vue`**

Capa absoluta (`position: absolute; inset: 0`) con el mismo grid template que la sección. Se posiciona encima de los bloques pero debajo del canvas de grid lines.

Solo se activa cuando `drawingStore.activeSectionId === section.id`, mostrando un div semi-transparente posicionado con `grid-column` / `grid-row` en el área seleccionada.

---

## Archivos

| Archivo | Rol |
|---|---|
| `src/composables/useGridConversion.ts` | Conversión píxel → grid, colisiones, push-down, trim |
| `src/stores/drawingStore.ts` | Estado reactivo del dibujo |
| `src/composables/useNewBlock.ts` | Handler de drag con interactjs, creación de bloques |
| `src/components/editor/DrawingOverlay.vue` | Preview visual de la selección |
| `src/types/layout.ts` | Tipos `BlockCoords`, `Block`, `Section`, `MODE_KEY` |
