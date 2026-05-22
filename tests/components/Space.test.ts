import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { Block, Section } from '@/types/layout'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: 'es' } })
}))

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

// Mock composables used by block components
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

vi.mock('@/composables/useMoveBlock', () => ({
  useMoveBlock: vi.fn()
}))

vi.mock('@/composables/useResizeBlock', () => ({
  useResizeBlock: vi.fn()
}))

vi.mock('@/composables/useFontSize', () => ({
  useFontSize: () => ({ computedStyles: { value: null } })
}))

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({ effectiveTheme: { value: 'light' } })
}))

vi.mock('@imengyu/vue3-context-menu', () => ({
  default: { showContextMenu: vi.fn() }
}))

// Mock stores
vi.mock('@/stores/pageStore', () => ({
  pageStore: vi.fn(() => ({
    page: null,
    currentLocale: 'es',
    clipboardBlock: null,
    setActiveBlock: vi.fn()
  }))
}))

vi.mock('@/stores/historyStore', () => ({
  historyStore: vi.fn(() => ({
    snapshot: vi.fn(),
    canUndo: { value: false }
  }))
}))

vi.mock('@/stores/settingsStore', () => ({
  settingsStore: vi.fn(() => ({
    setSetting: vi.fn()
  }))
}))

vi.mock('@/stores/siteStore', () => ({
  siteStore: vi.fn(() => ({
    site: {
      id: 1,
      options: {
        darkMode: false,
        darkColor: '#EEEEEE',
        lightColor: '#292929',
        desktopWidth: 1260,
        fonts: []
      }
    },
    REACT401: 0
  }))
}))

vi.mock('@/stores/viewportStore', () => ({
  viewportStore: vi.fn(() => ({
    mode: { value: 'desktop' }
  }))
}))

import Space from '@/components/editor/blocks/Space.vue'

const createSection = (): Section => ({
  id: 1,
  blocks: [],
  mobile: { cols: 8, rows: 12, gap: 8 },
  tablet: { cols: 20, rows: 12, gap: 8 },
  desktop: { cols: 24, rows: 12, gap: 12 },
  style: {
    maxWidth: null,
    fullWidth: false,
    hideOn: [],
    section_background: { mode: 'none' } as any,
    background: { mode: 'none' } as any,
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '0', r: '0', b: '0', l: '0' }
  }
})

const createBlock = (overrides = {}): Block => ({
  id: 1,
  type: 'Space',
  d: { x: 1, y: 1, w: 4, h: 2 },
  m: { x: 1, y: 1, w: 4, h: 2 },
  t: { x: 1, y: 1, w: 4, h: 2 },
  style: {
    hideOn: [],
    background: { mode: 'none' } as any,
    border: { radius: { tl: '0', tr: '0', br: '0', bl: '0' }, allBorders: { active: false, thick: '0', color: 'transparent', mode: 'none' } },
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '0', r: '0', b: '0', l: '0' }
  },
  ...overrides
})

describe('Space.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountComponent = (blockOverrides = {}) => {
    return mount(Space, {
      props: {
        block: createBlock(blockOverrides),
        section: createSection()
      },
      global: {
        plugins: [pinia]
      }
    })
  }

  it('renders with block class', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.block').exists()).toBe(true)
  })

  it('renders a resize element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.blockui.resize').exists()).toBe(true)
  })

  it('does not render divider when no divider config', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.space-divider').exists()).toBe(false)
  })

  it('renders divider when active', () => {
    const wrapper = mountComponent({
      divider: { active: true, thick: 1, mode: 'solid', color: '#333' }
    })
    expect(wrapper.find('.space-divider').exists()).toBe(true)
  })

  it('does not render divider when inactive', () => {
    const wrapper = mountComponent({
      divider: { active: false, thick: 1, mode: 'solid', color: '#333' }
    })
    expect(wrapper.find('.space-divider').exists()).toBe(false)
  })

  it('divider style includes borderTop', () => {
    const wrapper = mountComponent({
      divider: { active: true, thick: 2, mode: 'dashed', color: 'red' }
    })
    const divider = wrapper.find('.space-divider')
    expect(divider.attributes('style')).toContain('border-top')
  })
})
