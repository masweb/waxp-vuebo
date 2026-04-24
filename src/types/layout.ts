import type { Font } from './defaultOptions'

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

export type BlockLinkType = 'internal' | 'external' | 'anchor'

export interface BlockLink {
  type: BlockLinkType
  url: string
}

export interface Block {
  id: number
  type: string
  locales?: Record<string, string>
  d: BlockCoords
  m: BlockCoords
  t: BlockCoords
  style: BlockStyle
  color?: null | string
  darkColor?: null | string
  fontSize?: null | number
  lineHeight?: null | number
  divider?: SideBorder
  image?: BlockImage
  link?: BlockLink
  button?: BlockButton
  menu?: MenuItem[]
  menuColors?: MenuColors
  menuFont?: Font
  menuFontSize?: null | number
  menuLineHeight?: null | number
  menuSubFont?: Font
  menuSubFontSize?: null | number
  menuSubLineHeight?: null | number
  isMobileMenu?: boolean
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
  section_background: Background
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
  url_tab: string
  url_mob: string
  opacity: string
  fix_img_back: boolean
  pos: 'cover' | 'contain' | 'top' | 'bottom' | 'left' | 'right'
  size: string
  repeat: boolean
  lightGradA: string
  lightGradB: string
  darkGradA: string
  darkGradB: string
  gradDeg: string
  focalX: string
  focalY: string
  zoom: string
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

const defaultBackground = (): Background => ({
  mode: 'none',
  lightColor: '',
  darkcolorColor: '',
  url_desk: '',
  url_tab: '',
  url_mob: '',
  opacity: '1',
  fix_img_back: false,
  pos: 'cover',
  size: '',
  repeat: false,
  lightGradA: '',
  lightGradB: '',
  darkGradA: '',
  darkGradB: '',
  gradDeg: '',
  focalX: '50',
  focalY: '50',
  zoom: '100'
})

export const createSection = (id: number): Section => ({
  id,
  blocks: [],
  mobile: { cols: 8, rows: 12, gap: 8 },
  tablet: { cols: 20, rows: 12, gap: 8 },
  desktop: { cols: 24, rows: 12, gap: 12 },
  style: {
    maxWidth: null,
    fullWidth: false,
    hideOn: [],
    section_background: defaultBackground(),
    background: defaultBackground(),
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '6px', r: '0', b: '6px', l: '0' }
  }
})

export type BlockImageFit = 'width' | 'height' | 'cover'

export interface BlockImage {
  url_desk: string
  url_tab: string
  url_mob: string
  fit: BlockImageFit
}

export interface BlockButtonColors {
  light: string
  dark: string
}

export interface MenuColors {
  color: BlockButtonColors
  hover: BlockButtonColors
  active: BlockButtonColors
}

export interface MenuItem {
  label: string
  link?: BlockLink
  children?: MenuItem[]
}

export interface BlockButton {
  bg: BlockButtonColors
  hover: BlockButtonColors
  active: BlockButtonColors
  focus: BlockButtonColors
  textColor: BlockButtonColors
  hoverTextColor: BlockButtonColors
  activeTextColor: BlockButtonColors
  borderColor: BlockButtonColors
  border: Border
  width: string
  padding: Sides
}
