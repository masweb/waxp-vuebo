# Block move

Mover bloques dentro de su sección mediante drag & drop sobre el handler `.blockui.move`. Inspirado en el proyecto `waxp-handler`.

---

## Arquitectura

```
drag en .blockui.move
  → useMoveBlock (interactjs draggable)
    → transform: translate3d() (feedback visual del bloque)
    → drawingStore.setMoveShadow() (shadow overlay de la posición destino)
  → end: actualiza coords reactivas, pushDown, ensureRows, trimRows
```

---

## Composable

**`src/composables/useMoveBlock.ts`**

Se invoca desde `PageBlock.vue` con el ref del elemento bloque y getters del bloque y sección.

```typescript
useMoveBlock(
  blockEl: Ref<HTMLElement | undefined>,
  block: () => Block,
  section: () => Section,
)
```

interactjs `draggable` sobre el `.block` con `allowFrom: '.blockui.move'`.

---

## cellHalf — Snapping simétrico

El problema original: usando la esquina superior-izquierda como punto de detección, el snap es asimétrico:
- Mover a la izquierda → salta de celda en 1px (en cuanto toca la columna anterior)
- Mover a la derecha → necesita el step completo (todo el ancho de celda + gap)

La solución: desplazar el punto de detección al **centro de la primera celda** del bloque sumando `cellHalf`:

```
cellHalf = cellWidth / 2
relX = blockRect.left - sectionRect.left + cellHalf
relY = blockRect.top - sectionRect.top + cellHalf
```

Así en ambas direcciones se necesita ~medio cell de movimiento antes de snappear — comportamiento simétrico y natural.

---

## Ciclo de vida del drag

### `start`

1. Busca la sección ancestra via `.closest('.section')`
2. Cachea `sectionRect` (no cambia durante el drag)
3. Guarda coords originales del bloque (`MODE_KEY[vp.mode]`)
4. Añade clase `.block--moving` (z-index + opacidad)
5. Muestra shadow inicial con las coords originales

### `move`

1. Acumula `position.x += event.dx`, `position.y += event.dy`
2. Aplica `transform: translate3d(px, py, 0)` al bloque (feedback visual, GPU-acelerado)
3. **Throttleado con `requestAnimationFrame`**: calcula nueva posición grid con `pixelToGrid(relX + cellHalf, relY + cellHalf, ..., allowRowOverflow=true)`, clampa x para no exceder el grid, actualiza el shadow via `drawingStore.setMoveShadow`
4. Si las filas necesarias exceden las actuales, expande la sección

### `end`

1. Calcula posición final (misma lógica que move)
2. Actualiza coords del bloque en el modo activo (`block[modeKey] = newCoords`)
3. Ejecuta `pushDown` para resolver colisiones con bloques existentes
4. Ejecuta `ensureRows` para ajustar filas
5. Para los otros 2 modos: `findFreeCoords` busca posición libre
6. Ejecuta `trimRows` para eliminar filas vacías
7. Limpia transform, clase `.block--moving` y estado

---

## Conflicto con `useNewBlock`

El draggable de `useNewBlock` está sobre la sección entera. El de `useMoveBlock` sobre el bloque. Para evitar conflictos:

- `useNewBlock` usa `ignoreFrom: '.blockui'` — no captura eventos sobre los controles de bloque
- interactjs usa el interactable más profundo en el DOM (el bloque), así que el drag sobre `.blockui.move` va al move handler, no al draw handler

---

## Shadow overlay

El `DrawingOverlay` muestra un rectángulo semi-transparente en la posición destino del bloque. Se actualiza en cada frame via `drawingStore.setMoveShadow(coords, sectionId)`. El bloque original se mueve visualmente con `transform` mientras el shadow indica dónde aterrizará.

---

## Estados CSS

| Clase | Efecto |
|---|---|
| `.block--moving` | `z-index: 10; opacity: 0.7` |

---

## Ver también

- [Block drawing](block-drawing.md) — Dibujar bloques nuevos
- [Block resize](block-resize.md) — Redimensionar bloques
- [Block positioning](block-positioning.md) — CSS Grid, `contain: size`
