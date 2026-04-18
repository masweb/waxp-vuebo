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
