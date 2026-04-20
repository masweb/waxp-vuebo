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
  style: BlockStyle
}

export interface Section {
  id: number
  blocks: Block[]
  mobile: BreakpointSize
  tablet: BreakpointSize
  desktop: BreakpointSize
  style: SectionStyle
}

export interface SectionStyle {
  maxWidth: null | number
  fullWidth: boolean
  hideOn: ('mobile' | 'tablet' | 'desktop')[]
  background: Background
  // border: Border
  padding: Sides
  margin: Sides
}
export interface BlockStyle {
  hideOn: ('mobile' | 'tablet' | 'desktop')[]
  background: Background
  border: Border
  padding: Sides
}

export interface Background {
  mode: 'none' | 'image' | 'color' | 'gradient'
  lightColor: string
  darkcolorColor: string
  url_desk: string
  url_mov: string
  url_thumb: string
  opacity: string
  fix_img_back: boolean
  pos: 'img' | 'cover' | 'contain' | 'top' | 'bottom' | 'left' | 'right'
  size: string
  repeat: boolean
  lightGradA: string
  lightGradB: string
  darkGradA: string
  darkGradB: string
  gradDeg: string
}

export interface Border {
  radius: Corners
  allBorders: SideBorder
  sidesBorders?: SidesBorders
}

export interface SidesBorders {
  l: SideBorder
  t: SideBorder
  r: SideBorder
  b: SideBorder
}

export interface SideBorder {
  active: boolean
  color: string
  thick: string
  mode: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none'
}

export interface Sides {
  t: string
  r: string
  b: string
  l: string
}

export interface Corners {
  tl: string
  tr: string
  br: string
  bl: string
}

export type ViewportMode = 'mobile' | 'tablet' | 'desktop'

export const MODE_KEY: Record<ViewportMode, 'd' | 'm' | 't'> = {
  mobile: 'm',
  tablet: 't',
  desktop: 'd'
}
