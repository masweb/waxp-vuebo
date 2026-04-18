import type { Section } from './layout'

export interface siteOptions {
  darkColor: string
  lightColor: string
  darkBackColor: string
  lightBackColor: string
  fonts: Fonts[]
  globalFontFamily: Font
  fontSize: number
  lineHeight: number
  darkMode: boolean
  mobileBP: number
  mobileTextZoom: number
  tabletBP: number
  tabletTextZoom: number
  desktopWidth: number | null
  header: Section
  footer: Section
}

export interface Fonts {
  family: string
  weights: number[]
  italics?: number[]
}
export interface Font {
  family: string
  weight: number
  italic?: boolean
}

export const siteOptions: siteOptions = {
  darkColor: '#EEEEEE',
  lightColor: '#333333',
  darkBackColor: '#111111',
  lightBackColor: '#EEEEEE',
  header: {
    id: 1,
    blocks: [
      {
        d: { h: 3, w: 24, x: 1, y: 1 },
        m: { h: 2, w: 8, x: 1, y: 1 },
        t: { h: 3, w: 20, x: 1, y: 1 },
        id: 1,
        type: 'Text',
        content: '<h3>Header</h3>'
      }
    ],
    mobile: { gap: 4, cols: 8, rows: 4 },
    tablet: { gap: 6, cols: 20, rows: 4 },
    desktop: { gap: 8, cols: 24, rows: 4 }
  },
  footer: {
    id: 2,
    blocks: [
      {
        d: { h: 3, w: 24, x: 1, y: 1 },
        m: { h: 2, w: 8, x: 1, y: 1 },
        t: { h: 3, w: 20, x: 1, y: 1 },
        id: 2,
        type: 'Text',
        content: '<h3>Footer</h3>'
      }
    ],
    mobile: { gap: 4, cols: 8, rows: 4 },
    tablet: { gap: 6, cols: 20, rows: 4 },
    desktop: { gap: 8, cols: 24, rows: 4 }
  },
  fonts: [
    {
      family: 'Montserrat',
      weights: [400],
      italics: []
    }
  ],
  globalFontFamily: {
    family: 'Montserrat',
    weight: 400,
    italic: false
  },
  fontSize: 1,
  lineHeight: 1.4,
  darkMode: true,
  mobileBP: 767,
  mobileTextZoom: 3,
  tabletBP: 1024,
  tabletTextZoom: 1.5,
  desktopWidth: 1200
}
