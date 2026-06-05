/**
 * useMeasureBlock — Precomputation matrix benchmark.
 *
 * Tests the viability of Option 1: pre-computed measurement lookup table.
 *
 * IMPORTANT: happy-dom (our test environment) does NOT have a CSS layout engine.
 * `scrollHeight` always returns 0, so DOM-based measurement cannot work here.
 * The measurement IS correct in a real browser (useMeasureBlock is production code).
 *
 * This test serves two purposes:
 *   1. Prove the mathematical estimation approach works as fallback
 *   2. Document the expected data shape the AI would consume
 *
 * To get REAL DOM measurements, run this in a browser:
 *   1. Open waxp in dev mode
 *   2. Paste the measureInBrowser() function in console
 *   3. Copy the resulting JSON
 */
import { describe, it, expect } from 'vitest'
import {
  measureBlockHeights,
  type MeasuresConfig,
  type BlockStyleOverrides,
} from '@/composables/useMeasureBlock'
import type { ViewportMode } from '@/types/layout'

// ── helpers ─────────────────────────────────────────────────────────────────

function sampleText(targetChars: number, tag: 'p' | 'h1' | 'h2' | 'h3' = 'p'): string {
  const word = 'lorem'
  let result = ''
  while (result.length < targetChars) {
    result += word + ' '
  }
  const content = result.slice(0, targetChars).trim()
  if (tag === 'p') return `<p>${content}</p>`
  return `<${tag}>${content}</${tag}>`
}

function mixedSample(targetChars: number): string {
  const third = Math.floor(targetChars / 3)
  return [
    `<h1>${'Heading '.repeat(Math.ceil(third / 8))}</h1>`,
    `<h2>${'Subheading '.repeat(Math.ceil(third / 11))}</h2>`,
    `<p>${'Body text '.repeat(Math.ceil(third / 10))}</p>`,
    `<ul><li>${'Point one '.repeat(Math.ceil(third / 10))}</li></ul>`,
  ].join('')
}

function makeConfig(vp: ViewportMode, fullWidth = false): MeasuresConfig {
  const vpWidths: Record<ViewportMode, number> = { desktop: 1920, tablet: 820, mobile: 480 }
  const colsGap: Record<ViewportMode, { cols: number; gap: number }> = {
    desktop: { cols: 24, gap: 12 },
    tablet: { cols: 20, gap: 8 },
    mobile: { cols: 8, gap: 8 },
  }

  return {
    sectionMaxWidth: 1260,
    sectionFullWidth: fullWidth,
    sectionPadding: { t: '0', r: '0', b: '0', l: '0' },
    cols: colsGap[vp].cols,
    gap: colsGap[vp].gap,
    viewportWidth: vpWidths[vp],
    baseFontSize: 1,
    baseLineHeight: 1.4,
    desktopTextZoom: 1,
    viewportMode: vp,
  }
}

const defaultBlockStyle: BlockStyleOverrides = {
  padding: { t: '0', r: '0', b: '0', l: '0' },
}

// ── mathematical estimation (no DOM needed) ────────────────────────────────

interface GridDimensions {
  cols: number
  gap: number
  sectionMaxWidth: number
  sectionPadL: number
  sectionPadR: number
}

function cellWidthPx(g: GridDimensions): number {
  const contentW = g.sectionMaxWidth - g.sectionPadL - g.sectionPadR
  return (contentW - (g.cols - 1) * g.gap) / g.cols
}

function blockWidthPx(colSpan: number, g: GridDimensions): number {
  const cw = cellWidthPx(g)
  return cw * colSpan + (colSpan - 1) * g.gap
}

/** Estimate chars per line: block width / avg char width.
 *  Montserrat at 1em has avg char width ≈ 0.5em ≈ 8px at 16px base. */
function estimatedCharsPerLine(colSpan: number, g: GridDimensions): number {
  const bw = blockWidthPx(colSpan, g)
  return Math.floor(bw / 8) // 8px ≈ avg char width for Montserrat at 16px
}

/** Estimate lines from char count: ceil(chars / charsPerLine). */
function estimatedLines(chars: number, colSpan: number, g: GridDimensions): number {
  const cpl = estimatedCharsPerLine(colSpan, g)
  if (cpl <= 0) return 1
  return Math.ceil(chars / cpl)
}

/** Estimate row height: fontSize(em) × lineHeight(unitless) × 16px. */
function estimatedRowHeightPx(fontSizeEm: number, lineHeight: number): number {
  return fontSizeEm * lineHeight * 16
}

/** Convert lines to grid rows: ceil(lines × rowHeight / rowHeight) = lines (simplified). */
function estimatedRows(lines: number): number {
  return lines // each line ≈ 1 row when row height = body line height
}

// ── test data ───────────────────────────────────────────────────────────────

const CHAR_LENGTHS = [50, 100, 200, 500, 1000, 2000]
const DESKTOP_SPANS = [4, 6, 8, 12, 16, 20, 24]
const TABLET_SPANS = [4, 6, 8, 12, 16, 20]
const MOBILE_SPANS = [2, 3, 4, 6, 8]

const GRID_DIMS: Record<ViewportMode, GridDimensions> = {
  desktop: { cols: 24, gap: 12, sectionMaxWidth: 1260, sectionPadL: 0, sectionPadR: 0 },
  tablet: { cols: 20, gap: 8, sectionMaxWidth: 1260, sectionPadL: 0, sectionPadR: 0 },
  mobile: { cols: 8, gap: 8, sectionMaxWidth: 1260, sectionPadL: 0, sectionPadR: 0 },
}

// ── tests ───────────────────────────────────────────────────────────────────

describe('DOM measurement (happy-dom limitation)', () => {
  it('confirms happy-dom does not compute scrollHeight', () => {
    const config = makeConfig('desktop')
    const html = sampleText(1000, 'p')
    const result = measureBlockHeights(html, config, defaultBlockStyle)

    // All heights will be 0 because happy-dom has no layout engine
    const allZero = Object.values(result.heights).every(h => h === 0)
    console.log(
      `[happy-dom] All heights zero: ${allZero}. ` +
        `happy-dom cannot measure text — needs real browser (Playwright) or jsdom with layout.`
    )
    expect(allZero).toBe(true)
  })
})

describe('Mathematical estimation matrix (no DOM needed)', () => {
  /**
   * This is the FALLBACK approach: estimate rows from character count.
   * It's less accurate than DOM measurement but works anywhere.
   *
   * For each (viewport, colSpan, charLength), compute:
   *   cellWidth → blockWidth → charsPerLine → lines → rows
   */

  it('prints grid dimensions per viewport', () => {
    for (const vp of ['desktop', 'tablet', 'mobile'] as ViewportMode[]) {
      const g = GRID_DIMS[vp]
      const cw = cellWidthPx(g)
      console.log(`[grid] ${vp}: cols=${g.cols} gap=${g.gap}px cellWidth=${Math.floor(cw)}px`)
    }
  })

  it('prints chars-per-line table', () => {
    const spans = DESKTOP_SPANS
    const g = GRID_DIMS['desktop']

    console.log(`\n─── chars per line (desktop, Montserrat ~8px/char) ───`)
    const header = `colSpan | ${spans.map(s => `${s}col`.padEnd(8)).join('| ')}`
    console.log(header)
    console.log('-'.repeat(header.length))

    const rowParts = spans.map(s => {
      const cpl = estimatedCharsPerLine(s, g)
      return `${cpl}ch`.padEnd(8)
    })
    console.log(`chars   | ${rowParts.join('| ')}`)
  })

  it('prints estimated rows matrix (body text, desktop)', () => {
    const spans = DESKTOP_SPANS
    const g = GRID_DIMS['desktop']

    console.log(`\n─── estimated rows: body text, desktop ───`)
    console.log(`(row height = 1em × 1.4lh × 16px = 22.4px)`)

    // Header
    const header = `chars    | ${spans.map(s => `${s}col`.padEnd(8)).join('| ')}`
    console.log(header)
    console.log('-'.repeat(header.length))

    for (const chars of CHAR_LENGTHS) {
      const rowParts = spans.map(s => {
        const lines = estimatedLines(chars, s, g)
        return `${lines}r`.padEnd(8)
      })
      console.log(`${String(chars).padEnd(8)} | ${rowParts.join('| ')}`)
    }
  })

  it('prints estimated rows matrix (body text, all viewports)', () => {
    for (const vp of ['desktop', 'tablet', 'mobile'] as ViewportMode[]) {
      const g = GRID_DIMS[vp]
      const spans = vp === 'desktop' ? DESKTOP_SPANS : vp === 'tablet' ? TABLET_SPANS : MOBILE_SPANS

      console.log(`\n─── ${vp} — estimated rows (body text) ───`)

      const header = `chars    | ${spans.map(s => `${s}col`.padEnd(8)).join('| ')}`
      console.log(header)
      console.log('-'.repeat(header.length))

      for (const chars of CHAR_LENGTHS) {
        const rowParts = spans.map(s => {
          const lines = estimatedLines(chars, s, g)
          return `${lines}r`.padEnd(8)
        })
        console.log(`${String(chars).padEnd(8)} | ${rowParts.join('| ')}`)
      }
    }
  })
})

describe('Expected AI data shape', () => {
  /**
   * This documents the JSON structure the AI would receive.
   * After real DOM measurement (in browser), this data powers layout decisions.
   */
  it('documents the precomputation matrix shape', () => {
    const example = {
      siteId: 1,
      generatedAt: '2026-06-05T16:00:00Z',
      fonts: {
        body: { family: 'Montserrat', weight: 400, sizeEm: 1, lineHeight: 1.4 },
        H1: { family: 'Inter', weight: 800, sizeEm: 2.5, lineHeight: 1 },
        H2: { family: 'Inter', weight: 800, sizeEm: 2.2, lineHeight: 1 },
        H3: { family: 'Inter', weight: 800, sizeEm: 1.9, lineHeight: 1 },
        H4: { family: 'Inter', weight: 800, sizeEm: 1.6, lineHeight: 1 },
        H5: { family: 'Inter', weight: 800, sizeEm: 1.3, lineHeight: 1 },
        H6: { family: 'Inter', weight: 800, sizeEm: 0.9, lineHeight: 1 },
      },
      grid: {
        desktop: { cols: 24, gap: 12, cellWidthPx: 41, rowHeightPx: 22.4 },
        tablet: { cols: 20, gap: 8, cellWidthPx: 55, rowHeightPx: 22.96 },
        mobile: { cols: 8, gap: 8, cellWidthPx: 140, rowHeightPx: 17.28 },
      },
      // Core lookup: for each (textType, viewport), linear coefficient
      // rows ≈ slope × chars + intercept
      curves: {
        body: {
          desktop: { slope: 0.022, intercept: 0.5, note: 'rows = slope × chars + intercept, ceil result' },
          tablet: { slope: 0.019, intercept: 0.5 },
          mobile: { slope: 0.008, intercept: 0.5 },
        },
        H1: {
          desktop: { slope: 0.035, intercept: 1, note: 'larger font = more rows per char' },
        },
        // ... H2-H6
      },
    }

    console.log('[data-shape] AI would receive:', JSON.stringify(example, null, 2))
    expect(example.grid.desktop.cols).toBe(24)
  })
})
