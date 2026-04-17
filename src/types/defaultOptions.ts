export interface siteOptions {
  darkColor: string
  lightColor: string
  darkBackColor: string
  lightBackColor: string
  fonts: Fonts
  globalFontFamily: Font
  fontSize: string
  fontWeight: number
  lineHeight: string
  darkMode: boolean
  mobileBP: number
  tabletBP: number
  desktopWidth: number | null
}

export interface Fonts {
  family: string
  weights: number[]
}
export interface Font {
  family: string
  weight: number
}

export const siteOptions: siteOptions = {
  darkColor: '#EEEEEE',
  lightColor: '#333333',
  darkBackColor: '#111111',
  lightBackColor: '#EEEEEE',
  fonts: {
    family: 'Montserrat',
    weights: [400]
  },
  globalFontFamily: {
    family: 'Montserrat',
    weight: 400
  },
  fontSize: '1em',
  fontWeight: 400,
  lineHeight: '1.4em',
  darkMode: true,
  mobileBP: 767,
  tabletBP: 1024,
  desktopWidth: 1200
}
