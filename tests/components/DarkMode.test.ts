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

// Mock composables
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

// Mock stores
vi.mock('@/stores/pageStore', () => ({
  pageStore: vi.fn(() => ({ page: null, currentLocale: 'es', clipboardBlock: null, setActiveBlock: vi.fn() }))
}))
vi.mock('@/stores/historyStore', () => ({
  historyStore: vi.fn(() => ({ snapshot: vi.fn(), canUndo: { value: false } }))
}))
vi.mock('@/stores/settingsStore', () => ({
  settingsStore: vi.fn(() => ({ setSetting: vi.fn() }))
}))

const mockSiteOptions = {
  darkMode: false,
  darkColor: '#EEEEEE',
  lightColor: '#292929',
  desktopWidth: 1260,
  fonts: []
}

vi.mock('@/stores/siteStore', () => ({
  siteStore: vi.fn(() => ({ site: { id: 1, options: { ...mockSiteOptions } }, REACT401: 0 }))
}))

vi.mock('@/stores/viewportStore', () => ({
  viewportStore: vi.fn(() => ({ mode: { value: 'desktop' } }))
}))

// Mock tabler icons
vi.mock('@tabler/icons-vue', () => ({
  IconSunFilled: { template: '<svg data-testid="icon-sun" />' },
  IconMoonFilled: { template: '<svg data-testid="icon-moon" />' }
}))

import DarkMode from '@/components/editor/blocks/DarkMode.vue'

const createSection = (): Section => ({
  id: 1,
  blocks: [],
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

const createBlock = (overrides = {}): Block => ({
  id: 1,
  type: 'DarkMode',
  d: { x: 1, y: 1, w: 1, h: 1 },
  m: { x: 1, y: 1, w: 1, h: 1 },
  t: { x: 1, y: 1, w: 1, h: 1 },
  style: {
    hideOn: [],
    background: { mode: 'none' } as any,
    border: { radius: { tl: '0', tr: '0', br: '0', bl: '0' }, allBorders: { active: false, thick: '0', color: 'transparent', mode: 'none' } },
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '0', r: '0', b: '0', l: '0' }
  },
  ...overrides
})

describe('DarkMode.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountComponent = (blockOverrides = {}) => {
    return mount(DarkMode, {
      props: {
        block: createBlock(blockOverrides),
        section: createSection()
      },
      global: {
        plugins: [pinia]
      }
    })
  }

  it('renders with darkmode-block class', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.darkmode-block').exists()).toBe(true)
  })

  it('renders a toggle button', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.darkmode-toggle').exists()).toBe(true)
  })

  it('renders moon icon when not dark mode (light mode)', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-testid="icon-moon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="icon-sun"]').exists()).toBe(false)
  })

  it('renders a resize element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.blockui.resize').exists()).toBe(true)
  })

  it('toggle button has click handler', () => {
    const wrapper = mountComponent()
    const btn = wrapper.find('.darkmode-toggle')
    expect(btn.exists()).toBe(true)
    // Click should not throw
    expect(() => btn.trigger('click')).not.toThrow()
  })
})
