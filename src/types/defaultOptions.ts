import type { Section } from './layout'

export interface siteOptions {
  darkColor: string
  lightColor: string
  darkBackColor: string
  lightBackColor: string
  darkAccentColor: string
  lightAccentColor: string
  fonts: Fonts[]
  globalFontFamily: Font
  fontSize: number
  lineHeight: number
  darkMode: boolean
  mobileBP: number
  mobileTextZoom: number
  tabletBP: number
  tabletTextZoom: number
  desktopTextZoom: number
  desktopWidth: number | null
  desktopMargin: number
  mobileMargin: number
  tabletMargin: number
  headers: HeadersConfig
  header: Section
  footer: Section
  faviconUrl?: string
  [key: string]: string | number | boolean | null | undefined | Fonts[] | Font | HeadersConfig | Section
}

export interface HeaderStyle {
  size: number
  family: string
  weight: number
  lineHeight: number
  italic?: boolean
}

export type HeadersConfig = Record<'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6', HeaderStyle>

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
  lightColor: '#292929',
  darkBackColor: '#1f1f1f',
  lightBackColor: '#EEEEEE',
  darkAccentColor: '#ff368c',
  lightAccentColor: '#2e90c8',
  fontSize: 1,
  lineHeight: 1.4,
  darkMode: true,
  mobileBP: 767,
  mobileTextZoom: 2.6,
  tabletBP: 1024,
  tabletTextZoom: 1,
  desktopTextZoom: 1,
  desktopWidth: 1260,
  desktopMargin: 10,
  mobileMargin: 10,
  tabletMargin: 10,
  headers: {
    H1: {
      size: 2.5,
      lineHeight: 1,
      family: 'Inter',
      weight: 800,
      italic: true
    },
    H2: {
      size: 2.2,
      lineHeight: 1,
      family: 'Inter',
      weight: 800,
      italic: true
    },
    H3: {
      size: 1.9,
      lineHeight: 1,
      family: 'Inter',
      weight: 800,
      italic: true
    },
    H4: {
      size: 1.6,
      lineHeight: 1,
      family: 'Inter',
      weight: 800,
      italic: true
    },
    H5: {
      size: 1.3,
      lineHeight: 1,
      family: 'Inter',
      weight: 800,
      italic: true
    },
    H6: {
      size: 0.9,
      lineHeight: 1,
      family: 'Inter',
      weight: 800,
      italic: true
    }
  },
  header: {
    id: 1,
    blocks: [
      {
        d: { h: 1, w: 4, x: 1, y: 1 },
        m: { h: 1, w: 3, x: 1, y: 1 },
        t: { h: 1, w: 5, x: 1, y: 1 },
        id: 1,
        type: 'Text',
        locales: {
          text: '<h2>Header</h2>'
        },
        style: {
          hideOn: [],
          background: {
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
          },
          border: {
            radius: {
              tl: '0',
              tr: '0',
              br: '0',
              bl: '0'
            },
            allBorders: {
              active: false,
              thick: '0',
              color: 'transparent',
              mode: 'none'
            },
            sidesBorders: {
              l: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              },
              t: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              },
              r: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              },
              b: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              }
            }
          },
          padding: {
            t: '0',
            r: '0',
            b: '0',
            l: '0'
          }
        }
      },
      {
        d: { h: 1, w: 1, x: 24, y: 1 },
        m: { h: 1, w: 1, x: 8, y: 1 },
        t: { h: 1, w: 1, x: 20, y: 1 },
        id: 3,
        type: 'DarkMode',
        color: null,
        style: {
          border: {
            radius: { bl: '0', br: '0', tl: '0', tr: '0' },
            allBorders: { mode: 'none', color: 'transparent', thick: '0', active: false },
            sidesBorders: {
              b: { mode: 'none', color: 'transparent', thick: '0', active: false },
              l: { mode: 'none', color: 'transparent', thick: '0', active: false },
              r: { mode: 'none', color: 'transparent', thick: '0', active: false },
              t: { mode: 'none', color: 'transparent', thick: '0', active: false }
            }
          },
          hideOn: [],
          padding: { b: '0', l: '0', r: '0', t: '0' },
          background: {
            pos: 'cover',
            mode: 'none',
            size: '',
            zoom: '100',
            focalX: '50',
            focalY: '50',
            repeat: false,
            gradDeg: '',
            opacity: '',
            url_mob: '',
            url_tab: '',
            url_desk: '',
            darkGradA: '',
            darkGradB: '',
            lightColor: '',
            lightGradA: '',
            lightGradB: '',
            fix_img_back: false,
            darkcolorColor: ''
          }
        },
        fontSize: null,
        darkColor: null
      },
      {
        d: { h: 1, w: 1, x: 23, y: 1 },
        m: { h: 1, w: 1, x: 7, y: 1 },
        t: { h: 1, w: 1, x: 19, y: 1 },
        id: 4,
        type: 'LanguageSwitcher',
        style: {
          border: {
            radius: { bl: '0', br: '0', tl: '0', tr: '0' },
            allBorders: { mode: 'none', color: 'transparent', thick: '0', active: false },
            sidesBorders: {
              b: { mode: 'none', color: 'transparent', thick: '0', active: false },
              l: { mode: 'none', color: 'transparent', thick: '0', active: false },
              r: { mode: 'none', color: 'transparent', thick: '0', active: false },
              t: { mode: 'none', color: 'transparent', thick: '0', active: false }
            }
          },
          hideOn: [],
          padding: { b: '0', l: '0', r: '0', t: '0' },
          background: {
            pos: 'cover',
            mode: 'none',
            size: '',
            zoom: '100',
            focalX: '50',
            focalY: '50',
            repeat: false,
            gradDeg: '',
            opacity: '',
            url_mob: '',
            url_tab: '',
            url_desk: '',
            darkGradA: '',
            darkGradB: '',
            lightColor: '',
            lightGradA: '',
            lightGradB: '',
            fix_img_back: false,
            darkcolorColor: ''
          }
        }
      }
    ],
    mobile: { gap: 6, cols: 8, rows: 1 },
    tablet: { gap: 8, cols: 20, rows: 1 },
    desktop: { gap: 10, cols: 24, rows: 1 },
    style: {
      maxWidth: null,
      fullWidth: false,
      hideOn: [],
      background: {
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
      },
      section_background: {
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
      },
      padding: {
        t: '0',
        r: '0',
        b: '0',
        l: '0'
      },
      margin: {
        t: '5px',
        r: '0',
        b: '5px',
        l: '0'
      }
    }
  },
  footer: {
    id: 2,
    blocks: [
      {
        d: { h: 2, w: 4, x: 1, y: 1 },
        m: { h: 2, w: 6, x: 1, y: 1 },
        t: { h: 3, w: 6, x: 1, y: 1 },
        id: 2,
        type: 'Text',
        locales: {
          text: '<h3>Footer</h3>'
        },
        style: {
          hideOn: [],
          background: {
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
          },
          border: {
            radius: {
              tl: '0',
              tr: '0',
              br: '0',
              bl: '0'
            },
            allBorders: {
              active: false,
              thick: '0',
              color: 'transparent',
              mode: 'none'
            },
            sidesBorders: {
              l: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              },
              t: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              },
              r: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              },
              b: {
                active: false,
                thick: '0',
                color: 'transparent',
                mode: 'none'
              }
            }
          },
          padding: {
            t: '0',
            r: '0',
            b: '0',
            l: '0'
          }
        }
      }
    ],
    mobile: { gap: 6, cols: 8, rows: 2 },
    tablet: { gap: 8, cols: 20, rows: 2 },
    desktop: { gap: 10, cols: 24, rows: 2 },
    style: {
      maxWidth: null,
      fullWidth: false,
      hideOn: [],
      background: {
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
      },
      section_background: {
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
      },
      padding: {
        t: '0',
        r: '0',
        b: '0',
        l: '0'
      },
      margin: {
        t: '5px',
        r: '0',
        b: '5px',
        l: '0'
      }
    }
  },
  fonts: [
    {
      family: 'Montserrat',
      weights: [400],
      italics: []
    },
    {
      family: 'Inter',
      weights: [400, 800],
      italics: [400, 800]
    }
  ],
  globalFontFamily: {
    family: 'Montserrat',
    weight: 400,
    italic: false
  }
}
