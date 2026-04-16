export interface BreakpointSize {
  cols: number
  rows: number
  gap: number
}

export interface Section {
  id: number
  blocks: unknown[]
  mobile: BreakpointSize
  tablet: BreakpointSize
  desktop: BreakpointSize
}

export type ViewportMode = 'mobile' | 'tablet' | 'desktop'
