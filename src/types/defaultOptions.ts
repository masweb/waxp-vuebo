export interface siteOptions {
  darkColor: string
  lightColor: string
  darkBackColor: string
  lightBackColor: string
  fontFamily: string
  fontSize: string
  fontWeight: number
  lineHeight: string
  darkMode: boolean
  mobileBP: number
  tabletBP: number
  desktopWidth: number | null
}

export const siteOptions: siteOptions = {
  darkColor: '#EEEEEE',
  lightColor: '#333333',
  darkBackColor: '#111111',
  lightBackColor: '#EEEEEE',
  fontFamily: 'Montserrat',
  fontSize: '1em',
  fontWeight: 400,
  lineHeight: '1.4em',
  darkMode: true,
  mobileBP: 767,
  tabletBP: 1024,
  desktopWidth: 1200
}
