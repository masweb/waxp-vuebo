interface GridCoordinates {
  col: number
  row: number
}

export const useGridConversion = () => {
  let cachedRect: { el: HTMLElement; rect: DOMRect; ts: number } | null = null

  const getSectionRect = (el: HTMLElement): DOMRect => {
    const now = performance.now()
    if (cachedRect && cachedRect.el === el && now - cachedRect.ts < 16) return cachedRect.rect
    const rect = el.getBoundingClientRect()
    cachedRect = { el, rect, ts: now }
    return rect
  }

  const pixelToGrid = (
    x: number,
    y: number,
    sectionEl: HTMLElement,
    config: BreakpointSize,
    allowRowOverflow = false
  ): GridCoordinates => {
    const rect = getSectionRect(sectionEl)
    const totalGapW = config.gap * (config.cols - 1)
    const cellW = (rect.width - totalGapW) / config.cols
    const cellH = allowRowOverflow ? cellW : (rect.height - config.gap * (config.rows - 1)) / config.rows
    const stepX = cellW + config.gap
    const stepY = cellH + config.gap

    let col = Math.floor(x / stepX) + 1
    if (col > config.cols) col = config.cols
    const colStart = (col - 1) * stepX
    if (x > colStart + cellW && col < config.cols) col++

    let row = Math.floor(y / stepY) + 1
    if (!allowRowOverflow && row > config.rows) row = config.rows
    if (!allowRowOverflow) {
      const rowStart = (row - 1) * stepY
      if (y > rowStart + cellH && row < config.rows) row++
      row = Math.max(1, Math.min(row, config.rows))
    }

    return { col: Math.max(1, Math.min(col, config.cols)), row: Math.max(1, row) }
  }

  const calculateGridPosition = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    sectionEl: HTMLElement,
    config: BreakpointSize,
    allowRowOverflow = false
  ): BlockCoords => {
    const start = pixelToGrid(startX, startY, sectionEl, config, allowRowOverflow)
    const end = pixelToGrid(endX, endY, sectionEl, config, allowRowOverflow)

    return {
      x: Math.min(start.col, end.col),
      y: Math.min(start.row, end.row),
      w: Math.abs(end.col - start.col) + 1,
      h: Math.abs(end.row - start.row) + 1
    }
  }

  const rectsOverlap = (a: BlockCoords, b: BlockCoords): boolean => {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  }

  const pushDown = (blocks: Block[], modeKey: 'd' | 'm' | 't', source: BlockCoords, sourceId: number) => {
    const sourceBottom = source.y + source.h
    const sourceLeft = source.x
    const sourceRight = source.x + source.w

    for (const block of blocks) {
      if (block.id === sourceId) continue
      const target = block[modeKey]
      const targetBottom = target.y + target.h
      const targetRight = target.x + target.w
      const targetLeft = target.x

      const overlapsX = targetRight > sourceLeft && targetRight > sourceLeft && targetLeft < sourceRight
      const isBelow = targetBottom > source.y
      const isIntersecting = overlapsX && isBelow

      if (!isIntersecting) continue

      target.y = sourceBottom
    }
  }

  const findFreeCoords = (section: Section, mode: ViewportMode, w: number, h: number): BlockCoords => {
    const bp = section[mode] as BreakpointSize
    const cw = Math.min(w, bp.cols)
    const ch = Math.min(h, bp.rows)
    const key = MODE_KEY[mode] as keyof Block
    const taken = section.blocks.map(b => b[key] as BlockCoords)

    for (let y = 1; y <= bp.rows - ch + 1; y++) {
      const candidate: BlockCoords = { x: 1, y, w: cw, h: ch }
      if (!taken.some(ex => rectsOverlap(candidate, ex))) return candidate
    }

    const maxY = taken.reduce((max, c) => Math.max(max, c.y + c.h), 0)
    bp.rows = maxY + ch
    return { x: 1, y: maxY + 1, w: cw, h: ch }
  }

  const ensureRows = (section: Section, mode: ViewportMode) => {
    const bp = section[mode] as BreakpointSize
    const key = MODE_KEY[mode] as keyof Block
    const maxBottom = section.blocks.reduce((max, b) => {
      const c = b[key] as BlockCoords
      return Math.max(max, c.y + c.h)
    }, 0)
    if (maxBottom > bp.rows) bp.rows = maxBottom
  }

  const trimRows = (section: Section) => {
    const modes: ViewportMode[] = ['mobile', 'tablet', 'desktop']
    for (const mode of modes) {
      const bp = section[mode] as BreakpointSize
      const key = MODE_KEY[mode] as keyof Block
      const maxBottom = section.blocks.reduce((max, b) => {
        const c = b[key] as BlockCoords
        return Math.max(max, c.y + c.h)
      }, 0)
      bp.rows = Math.max(0, maxBottom - 1)
    }
  }

  return {
    pixelToGrid,
    calculateGridPosition,
    rectsOverlap,
    pushDown,
    findFreeCoords,
    ensureRows,
    trimRows
  }
}
