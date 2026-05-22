import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { Block, Section } from '@/types/layout'

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
    site: { id: 1, options: { darkMode: false, darkColor: '#eee', lightColor: '#333', desktopWidth: 1260 } },
    REACT401: 0
  }))
}))

// Mock ALL tabler icon imports — factory must be self-contained (hoisted)
vi.mock('@tabler/icons-vue', () => {
  const mk = (name: string) => ({ template: `<svg data-testid="${name}" />`, props: ['size', 'strokeWidth'] })
  return {
    IconHomeFilled: mk('IconHomeFilled'),
    IconDog: mk('IconDog'),
    IconFish: mk('IconFish'),
    IconCat: mk('IconCat'),
    IconArrowBackUp: mk('IconArrowBackUp'),
    IconArrowBack: mk('IconArrowBack'),
    IconArrowBigDownFilled: mk('IconArrowBigDownFilled'),
    IconArrowBigLeftFilled: mk('IconArrowBigLeftFilled'),
    IconArrowBigRightFilled: mk('IconArrowBigRightFilled'),
    IconArrowBigUpFilled: mk('IconArrowBigUpFilled'),
    IconArrowNarrowDown: mk('IconArrowNarrowDown'),
    IconArrowNarrowLeft: mk('IconArrowNarrowLeft'),
    IconArrowNarrowRight: mk('IconArrowNarrowRight'),
    IconArrowNarrowUp: mk('IconArrowNarrowUp'),
    IconCaretDownFilled: mk('IconCaretDownFilled'),
    IconCaretLeftFilled: mk('IconCaretLeftFilled'),
    IconCaretRightFilled: mk('IconCaretRightFilled'),
    IconCaretUpFilled: mk('IconCaretUpFilled'),
    IconCaretUpDownFilled: mk('IconCaretUpDownFilled'),
    IconSquareArrowDownFilled: mk('IconSquareArrowDownFilled'),
    IconSquareArrowLeftFilled: mk('IconSquareArrowLeftFilled'),
    IconSquareArrowRightFilled: mk('IconSquareArrowRightFilled'),
    IconSquareArrowUpFilled: mk('IconSquareArrowUpFilled'),
    IconSquareChevronDownFilled: mk('IconSquareChevronDownFilled'),
    IconSquareChevronLeftFilled: mk('IconSquareChevronLeftFilled'),
    IconSquareChevronRightFilled: mk('IconSquareChevronRightFilled'),
    IconSquareChevronUpFilled: mk('IconSquareChevronUpFilled'),
    IconAwardFilled: mk('IconAwardFilled'),
    IconHome2Filled: mk('IconHome2Filled'),
    IconChartArcs3: mk('IconChartArcs3'),
    IconChartBarPopular: mk('IconChartBarPopular'),
    IconChartBar: mk('IconChartBar'),
    IconChartDonutFilled: mk('IconChartDonutFilled'),
    IconChartLine: mk('IconChartLine'),
    IconChartPieFilled: mk('IconChartPieFilled'),
    IconMailFilled: mk('IconMailFilled'),
    IconMailOpenedFilled: mk('IconMailOpenedFilled'),
    IconCloudDataConnectionFilled: mk('IconCloudDataConnectionFilled'),
    IconCurrencyDollar: mk('IconCurrencyDollar'),
    IconCurrencyEuro: mk('IconCurrencyEuro'),
    IconCurrencyPound: mk('IconCurrencyPound'),
    IconDatabaseFilled: mk('IconDatabaseFilled'),
    IconDatabasePlus: mk('IconDatabasePlus'),
    IconBlur: mk('IconBlur'),
    IconBlurOff: mk('IconBlurOff'),
    IconBlendMode: mk('IconBlendMode'),
    IconBoltFilled: mk('IconBoltFilled'),
    IconBoltOff: mk('IconBoltOff'),
    IconBoxMultipleFilled: mk('IconBoxMultipleFilled'),
    IconBriefcaseFilled: mk('IconBriefcaseFilled'),
    IconBorderCornerPill: mk('IconBorderCornerPill'),
    IconBorderCornerRounded: mk('IconBorderCornerRounded'),
    IconGrid3x3: mk('IconGrid3x3'),
    IconGrid4x4: mk('IconGrid4x4'),
    IconRadiusBottomLeft: mk('IconRadiusBottomLeft'),
    IconRadiusBottomRight: mk('IconRadiusBottomRight'),
    IconRadiusTopLeft: mk('IconRadiusTopLeft'),
    IconRadiusTopRight: mk('IconRadiusTopRight'),
    IconSquareHalf: mk('IconSquareHalf'),
    IconKeyFilled: mk('IconKeyFilled'),
    IconDeviceDesktopFilled: mk('IconDeviceDesktopFilled'),
    IconDeviceImacFilled: mk('IconDeviceImacFilled'),
    IconDeviceIpadFilled: mk('IconDeviceIpadFilled'),
    IconDeviceMobileFilled: mk('IconDeviceMobileFilled'),
    IconBrandGithubFilled: mk('IconBrandGithubFilled')
  }
})

import Icon from '@/components/editor/blocks/Icon.vue'

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

const createBlock = (overrides = {}): Block => ({
  id: 1, type: 'Icon',
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
  icon: { name: 'IconHomeFilled', strokeWidth: 1.5 },
  ...overrides
})

describe('Icon.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountComponent = (blockOverrides = {}) => {
    return mount(Icon, {
      props: {
        block: createBlock(blockOverrides),
        section: createSection()
      },
      global: { plugins: [pinia] }
    })
  }

  it('renders with icon-block class', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.icon-block').exists()).toBe(true)
  })

  it('renders an SVG icon component', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders default IconHomeFilled when no icon name set', () => {
    const wrapper = mountComponent({ icon: { name: '', strokeWidth: 1 } })
    expect(wrapper.find('[data-testid="IconHomeFilled"]').exists()).toBe(true)
  })

  it('renders the specified icon', () => {
    const wrapper = mountComponent({ icon: { name: 'IconDog', strokeWidth: 1 } })
    expect(wrapper.find('[data-testid="IconDog"]').exists()).toBe(true)
  })

  it('renders icon-block__inner container', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.icon-block__inner').exists()).toBe(true)
  })

  it('does not have href attribute when no link', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('a').exists()).toBe(false)
  })
})
