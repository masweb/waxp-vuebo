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
const { ref: vueRef } = await import('vue')
vi.mock('@/composables/useBlockLink', () => ({
  useBlockLink: () => ({
    hasLink: vueRef(false),
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
vi.mock('@/stores/viewportStore', () => ({
  viewportStore: vi.fn(() => ({ mode: { value: 'desktop' } }))
}))

vi.mock('@tabler/icons-vue', () => ({
  IconPhoto: { template: '<svg data-testid="icon-photo" />', props: ['size', 'strokeWidth'] }
}))

import ImageBlock from '@/components/editor/blocks/Image.vue'

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
  id: 1, type: 'Image',
  d: { x: 1, y: 1, w: 4, h: 3 },
  m: { x: 1, y: 1, w: 4, h: 3 },
  t: { x: 1, y: 1, w: 4, h: 3 },
  style: {
    hideOn: [],
    background: { mode: 'none' } as any,
    border: { radius: { tl: '0', tr: '0', br: '0', bl: '0' }, allBorders: { active: false, thick: '0', color: 'transparent', mode: 'none' } },
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '0', r: '0', b: '0', l: '0' }
  },
  image: {
    url_desk: '/img/photo.jpg',
    url_tab: '/img/photo-tab.jpg',
    url_mob: '/img/photo-mob.jpg',
    url_desk_dark: '',
    url_tab_dark: '',
    url_mob_dark: '',
    fit: 'cover'
  },
  locales: { alt: 'A photo' },
  ...overrides
})

describe('Image.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountComponent = (blockOverrides = {}) => {
    return mount(ImageBlock, {
      props: {
        block: createBlock(blockOverrides),
        section: createSection()
      },
      global: { plugins: [pinia] }
    })
  }

  it('renders with image-block class', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.image-block').exists()).toBe(true)
  })

  it('renders an img tag when url is provided', () => {
    const wrapper = mountComponent()
    const img = wrapper.find('img.image-block__img')
    expect(img.exists()).toBe(true)
  })

  it('sets the img src to the desktop URL', () => {
    const wrapper = mountComponent()
    const img = wrapper.find('img.image-block__img')
    expect(img.attributes('src')).toContain('/img/photo.jpg')
  })

  it('sets the alt text from locales', () => {
    const wrapper = mountComponent()
    const img = wrapper.find('img.image-block__img')
    expect(img.attributes('alt')).toBe('A photo')
  })

  it('renders placeholder when no image config', () => {
    const wrapper = mountComponent({ image: undefined })
    expect(wrapper.find('.image-block__placeholder').exists()).toBe(true)
    expect(wrapper.find('[data-testid="icon-photo"]').exists()).toBe(true)
  })

  it('renders placeholder when no URLs', () => {
    const wrapper = mountComponent({
      image: {
        url_desk: '', url_tab: '', url_mob: '',
        url_desk_dark: '', url_tab_dark: '', url_mob_dark: '',
        fit: 'cover'
      }
    })
    expect(wrapper.find('.image-block__placeholder').exists()).toBe(true)
  })

  it('renders resize element', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.blockui.resize').exists()).toBe(true)
  })

  it('does not render lightbox when lightbox is not set', () => {
    const wrapper = mountComponent()
    const img = wrapper.find('img.image-block__img')
    expect(img.classes()).not.toContain('lb-trigger')
  })

  it('renders lightbox trigger when lightbox is enabled', () => {
    const wrapper = mountComponent({
      image: {
        url_desk: '/img/photo.jpg', url_tab: '', url_mob: '',
        url_desk_dark: '', url_tab_dark: '', url_mob_dark: '',
        fit: 'cover',
        lightbox: true
      }
    })
    const img = wrapper.find('img.image-block__img')
    expect(img.classes()).toContain('lb-trigger')
  })

  it('applies cover fit style when fit is cover', () => {
    const wrapper = mountComponent()
    const img = wrapper.find('img.image-block__img')
    const style = img.attributes('style')
    expect(style).toContain('object-fit')
  })

  it('renders without link class when no link', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.block-link').exists()).toBe(false)
  })

  it('renders with block-link class when lightbox is enabled', () => {
    const wrapper = mountComponent({
      image: {
        url_desk: '/img/photo.jpg', url_tab: '', url_mob: '',
        url_desk_dark: '', url_tab_dark: '', url_mob_dark: '',
        fit: 'cover',
        lightbox: true
      }
    })
    expect(wrapper.find('.block-link').exists()).toBe(true)
  })
})
