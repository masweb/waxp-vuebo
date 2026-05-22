import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Page, Section } from '@/types/layout'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get _store() { return store }
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

// Mock useApi at module level
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

// Mock dependent stores
vi.mock('@/stores/siteStore', () => ({
  siteStore: vi.fn(() => ({ site: { id: 1 } }))
}))

vi.mock('@/stores/historyStore', () => ({
  historyStore: vi.fn(() => ({ clear: vi.fn() }))
}))

// Mock router
vi.mock('@/router', () => ({
  loadSiteRoutes: vi.fn(),
  clearRoutes: vi.fn()
}))

import { useApi } from '@/composables/useApi'
import { pageStore } from '@/stores/pageStore'

const makeSection = (id: number): Section => ({
  id,
  blocks: [],
  mobile: { cols: 8, rows: 12, gap: 8 },
  tablet: { cols: 20, rows: 12, gap: 8 },
  desktop: { cols: 24, rows: 12, gap: 12 },
  style: {
    maxWidth: null,
    fullWidth: false,
    hideOn: [],
    section_background: { mode: 'none', lightColor: '', darkcolorColor: '', url_desk: '', url_tab: '', url_mob: '', url_desk_dark: '', url_tab_dark: '', url_mob_dark: '', opacity: '1', fix_img_back: false, pos: 'cover', size: '', repeat: false, lightGradA: '', lightGradB: '', darkGradA: '', darkGradB: '', gradDeg: '', focalX: '50', focalY: '50', zoom: '100' },
    background: { mode: 'none', lightColor: '', darkcolorColor: '', url_desk: '', url_tab: '', url_mob: '', url_desk_dark: '', url_tab_dark: '', url_mob_dark: '', opacity: '1', fix_img_back: false, pos: 'cover', size: '', repeat: false, lightGradA: '', lightGradB: '', darkGradA: '', darkGradB: '', gradDeg: '', focalX: '50', focalY: '50', zoom: '100' },
    padding: { t: '0', r: '0', b: '0', l: '0' },
    margin: { t: '6px', r: '0', b: '6px', l: '0' }
  }
})

const makePage = (id: number): Page => ({
  id,
  site_id: 1,
  blog_id: null,
  parent_id: null,
  type: 'page',
  layout: [makeSection(10), makeSection(20)],
  published_at: null,
  title: ['Test Page'],
  description: ['Test Description'],
  seo: [],
  slugs: [],
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
})

describe('pageStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('initial state', () => {
    it('starts with null page', () => {
      const store = pageStore()
      expect(store.page).toBeNull()
    })

    it('starts with null activeSection', () => {
      const store = pageStore()
      expect(store.activeSection).toBeNull()
    })

    it('starts with null activeBlock', () => {
      const store = pageStore()
      expect(store.activeBlock).toBeNull()
    })

    it('starts with default locale es', () => {
      const store = pageStore()
      expect(store.currentLocale).toBe('es')
    })

    it('starts with null clipboard values', () => {
      const store = pageStore()
      expect(store.clipboardSection).toBeNull()
      expect(store.clipboardBlock).toBeNull()
    })
  })

  describe('setActiveBlock', () => {
    it('sets activeBlock to a given block', () => {
      const store = pageStore()
      const block = { id: 1, type: 'Text', d: { x: 1, y: 1, w: 4, h: 1 }, m: { x: 1, y: 1, w: 4, h: 1 }, t: { x: 1, y: 1, w: 4, h: 1 }, style: {} as any }
      store.setActiveBlock(block)
      expect(store.activeBlock).toEqual(block)
    })

    it('sets activeBlock to null', () => {
      const store = pageStore()
      store.setActiveBlock({ id: 1, type: 'Text', d: { x: 1, y: 1, w: 4, h: 1 }, m: { x: 1, y: 1, w: 4, h: 1 }, t: { x: 1, y: 1, w: 4, h: 1 }, style: {} as any } as any)
      store.setActiveBlock(null)
      expect(store.activeBlock).toBeNull()
    })
  })

  describe('setActiveSection', () => {
    it('sets activeSection by id from page layout', async () => {
      const mockPage = makePage(1)
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage)

      const store = pageStore()
      await store.getPage(1, 'es')

      store.setActiveSection(10)
      expect(store.activeSection).not.toBeNull()
      expect(store.activeSection!.id).toBe(10)
    })

    it('sets activeSection to null for non-existent section', async () => {
      const mockPage = makePage(1)
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage)

      const store = pageStore()
      await store.getPage(1, 'es')

      store.setActiveSection(999)
      expect(store.activeSection).toBeNull()
    })
  })

  describe('getPage', () => {
    it('fetches and sets the page', async () => {
      const mockPage = makePage(42)
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage)

      const store = pageStore()
      await store.getPage(42, 'en')

      expect(store.page).not.toBeNull()
      expect(store.page!.id).toBe(42)
      expect(store.currentLocale).toBe('en')
    })

    it('calls useApi with correct URL', async () => {
      const mockPage = makePage(5)
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage)

      const store = pageStore()
      await store.getPage(5, 'es')

      expect(useApi).toHaveBeenCalledWith(expect.stringContaining('/api/sites/'))
      expect(useApi).toHaveBeenCalledWith(expect.stringContaining('/pages/5'))
      expect(useApi).toHaveBeenCalledWith(expect.stringContaining('locale=es'))
    })

    it('does not set page on API error', async () => {
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue({ error: 'Not found', code: 404 })

      const store = pageStore()
      await store.getPage(999, 'es')

      expect(store.page).toBeNull()
    })
  })

  describe('updatePage', () => {
    it('updates page with server response', async () => {
      const mockPage = makePage(1)
      const updatedPage = { ...mockPage, title: ['Updated'] }
      ;(useApi as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockPage)
        .mockResolvedValueOnce(updatedPage)

      const store = pageStore()
      await store.getPage(1, 'es')
      await store.updatePage('es')

      expect(store.page!.title).toEqual(['Updated'])
    })
  })

  describe('localStorage persistence', () => {
    it('persists activeSection id to localStorage', async () => {
      const mockPage = makePage(1)
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage)

      const store = pageStore()
      await store.getPage(1, 'es')
      store.setActiveSection(10)

      await vi.dynamicImportSettled()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pageActiveSectionId',
        '10'
      )
    })

    it('clears activeSection to null for non-existent id', async () => {
      const mockPage = makePage(1)
      ;(useApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockPage)

      const store = pageStore()
      await store.getPage(1, 'es')
      store.setActiveSection(10)
      expect(store.activeSection).not.toBeNull()
      store.setActiveSection(999)
      expect(store.activeSection).toBeNull()
    })
  })
})
