export interface BreakpointSize {
  cols: number
  rows: number
  gap: number
}

export interface BlockCoords {
  x: number
  y: number
  w: number
  h: number
}

export interface Block {
  id: number
  type: string
  content: string
  d: BlockCoords
  m: BlockCoords
  t: BlockCoords
}

export interface Section {
  id: number
  blocks: Block[]
  mobile: BreakpointSize
  tablet: BreakpointSize
  desktop: BreakpointSize
}

export type ViewportMode = 'mobile' | 'tablet' | 'desktop'

export const MODE_KEY: Record<ViewportMode, 'd' | 'm' | 't'> = {
  mobile: 'm',
  tablet: 't',
  desktop: 'd',
}
