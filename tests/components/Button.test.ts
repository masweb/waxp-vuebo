import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { Block, Section, BlockButton } from '@/types/layout'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: 'es' } })
}))

vi.mock('@/composables/useApi', () => ({ useApi: vi.fn() }))
vi.mock('@/composables/useBlockBase', () => ({
  useBlockBase: () => ({
    blockRef: { value: null },
    blockStyle: { value: {} },
    backgroundStyle: { value: { overlay: null } },
    textStyle: { value: {} },
    onContextMenu: vi.fn()
  })
}))
vi.mock('@/composables/useBlockLink', () => ({
  useBlockLink: () => ({
    hasLink: { value: false },
    onBlockClick: vi.fn(),
    onMouseDown: vi.fn(),
    isDrag: () => false
  })
}))
vi.mock('@/composables/useBlockGrid', () => ({
  useBlockGrid: () => ({
    blockStyle: { value: {} },
    backgroundStyle: { value: { overlay: null } },
    textStyle: { value: {} }
  })
}))
vi.mock('@/composables/useMoveBlock', () => ({ useMoveBlock: vi.fn() }))
vi.mock('@/composables/useResizeBlock', () => ({ useResizeBlock: vi.fn() }))
vi.mock('@/composables/useFontSize', () => ({ useFontSize: () => ({ computedStyles: { value: null } }) }))
vi.mock('@/composables/useTheme', () => ({ useTheme: () => ({ effectiveTheme: { value: 'light' } }) }))
vi.mock('@imengyu/vue3-context-menu', () => ({ default: { showContextMenu: vi.fn() } }))

vi.mock('@/stores/pageStore', () => ({
  pageStore: vi.fn(() => ({ page: null, currentLocale: 'es', clipboardBlock: null, setActiveBlock: vi.fn() }))
}))
vi.mock('@/stores/historyStore', () => ({
  historyStore: vi.fn(() => ({ snapshot: vi.fn(), canUndo: { value: false } }))
}))
vi.mock('@/stores/settingsStore', () => ({
  settingsStore: vi.fn(() => ({ setSetting: vi.fn() }))
}))
vi.mock('@/stores/siteStore', () => ({
  siteStore: vi.fn(() => ({
    site: { id: 1, options: { darkMode: false, darkColor: '#eee', lightColor: '#333' } },
    REACT401: 0
  }))
}))

import Button from '@/components/editor/blocks/Button.vue'

const createSection = (): Section => ({
  id: 1, blocks: [],
  mobile: { cols: 8, rows: 12, gap: 8 },
  tablet: { cols: 20, rows: 12, gap: 8 },
  desktop: { cols: 24, rows: 12, gap: 12 },
  style: {
    maxWidth: null, fullWidth: false, hideOn: [],
    section_background: { mode: 'none' } as any,
    background: { mode: 'none' } as any,
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '0', r: '0', b: '0', l: '0' }
  }
})

const defaultButton: BlockButton = {
  bg: { light: '#007bff', dark: '#555' },
  hover: { light: '#0069d9', dark: '#666' },
  active: { light: '#0062cc', dark: '#777' },
  focus: { light: '#b3d7ff', dark: '#888' },
  textColor: { light: '#fff', dark: '#fff' },
  hoverTextColor: { light: '#fff', dark: '#fff' },
  activeTextColor: { light: '#fff', dark: '#fff' },
  borderColor: { light: '#000', dark: '#fff' },
  border: {
    radius: { tl: '4', tr: '4', br: '4', bl: '4' },
    allBorders: { active: false, thick: '1', color: 'transparent', mode: 'none' }
  },
  width: '100',
  padding: { t: '10', r: '20', b: '10', l: '20' }
}

const createBlock = (overrides = {}): Block => ({
  id: 1, type: 'Button',
  d: { x: 1, y: 1, w: 4, h: 1 },
  m: { x: 1, y: 1, w: 4, h: 1 },
  t: { x: 1, y: 1, w: 4, h: 1 },
  style: {
    hideOn: [],
    background: { mode: 'none' } as any,
    border: { radius: { tl: '0', tr: '0', br: '0', bl: '0' }, allBorders: { active: false, thick: '0', color: 'transparent', mode: 'none' } },
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '0', r: '0', b: '0', l: '0' }
  },
  button: defaultButton,
  locales: { label: 'Click Me' },
  ...overrides
})

describe('Button.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountComponent = (blockOverrides = {}) => {
    return mount(Button, {
      props: {
        block: createBlock(blockOverrides),
        section: createSection()
      },
      global: { plugins: [pinia] }
    })
  }

  it('renders with button-block class', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.button-block').exists()).toBe(true)
  })

  it('renders a button element with label text', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.button-block__btn').text()).toBe('Click Me')
  })

  it('renders empty label when no locales', () => {
    const wrapper = mountComponent({ locales: {} })
    expect(wrapper.find('.button-block__btn').text()).toBe('')
  })

  it('renders resize element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.blockui.resize').exists()).toBe(true)
  })

  it('button has style with background color', () => {
    const wrapper = mountComponent()
    const btn = wrapper.find('.button-block__btn')
    const style = btn.attributes('style')
    expect(style).toBeTruthy()
  })

  it('renders button without button config (no crash)', () => {
    const wrapper = mountComponent({ button: undefined })
    expect(wrapper.find('.button-block__btn').exists()).toBe(true)
  })
})
