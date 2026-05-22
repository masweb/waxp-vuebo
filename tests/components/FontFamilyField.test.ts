import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { Font } from '@/types/defaultOptions'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k })
}))

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

// We need to NOT mock siteStore so storeToRefs works with real pinia
// But we need the store to have the right data. Let's use real pinia + the actual store.

import FontFamilyField from '@/components/editor/settings/fields/FontFamilyField.vue'

describe('FontFamilyField.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const defaultFont: Font = { family: 'Inter', weight: 400, italic: false }

  const mountComponent = (props = {}) => {
    // Set up siteStore with test data through real pinia
    const st = siteStore()
    st.site = {
      id: 1,
      options: {
        darkMode: false,
        darkColor: '#eee',
        lightColor: '#333',
        fonts: [
          { family: 'Inter', weights: [400, 700] },
          { family: 'Montserrat', weights: [400], italics: [400] },
          { family: 'Roboto', weights: [300, 400, 700] }
        ]
      }
    } as any

    return mount(FontFamilyField, {
      props: {
        modelValue: defaultFont,
        ...props
      },
      global: {
        plugins: [pinia]
      },
      attachTo: document.body
    })
  }

  it('renders a search input', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('input.font-search-input').exists()).toBe(true)
  })

  it('displays current font family in input when closed', () => {
    const wrapper = mountComponent()
    const input = wrapper.find('input.font-search-input')
    expect((input.element as HTMLInputElement).value).toBe('Inter')
  })

  it('renders a label when provided', () => {
    const wrapper = mountComponent({ label: 'Font Family' })
    expect(wrapper.find('label').text()).toBe('Font Family')
  })

  it('does not render a label when not provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('shows clear button when font family is set', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.font-clear-btn').exists()).toBe(true)
  })

  it('does not show clear button when font family is empty', () => {
    const wrapper = mountComponent({ modelValue: { family: '', weight: 400, italic: false } })
    expect(wrapper.find('.font-clear-btn').exists()).toBe(false)
  })

  it('emits update:modelValue when clear button is clicked', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.font-clear-btn').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual({
      family: '',
      weight: 400,
      italic: false
    })
  })

  it('opens dropdown on input focus', async () => {
    const wrapper = mountComponent()
    await wrapper.find('input.font-search-input').trigger('focus')
    expect(wrapper.find('.font-dropdown').exists()).toBe(true)
  })

  it('shows filtered fonts when typing', async () => {
    const wrapper = mountComponent()
    const input = wrapper.find('input.font-search-input')
    await input.trigger('focus')
    await input.setValue('Rob')
    const items = wrapper.findAll('.font-dropdown-item')
    expect(items.length).toBe(1)
    expect(items[0].text()).toContain('Roboto')
  })

  it('emits update:modelValue when a font is picked from dropdown', async () => {
    const wrapper = mountComponent()
    await wrapper.find('input.font-search-input').trigger('focus')
    const items = wrapper.findAll('.font-dropdown-item')
    await items[1].trigger('click') // Montserrat
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue')![0][0] as Font
    expect(emitted.family).toBe('Montserrat')
    expect(emitted.weight).toBe(400)
  })

  it('renders variant select when a font with weights is selected', async () => {
    const wrapper = mountComponent()
    // Inter has weights [400, 700], so select should appear
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('closes dropdown on Escape key', async () => {
    const wrapper = mountComponent()
    await wrapper.find('input.font-search-input').trigger('focus')
    expect(wrapper.find('.font-dropdown').exists()).toBe(true)
    await wrapper.find('input.font-search-input').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.font-dropdown').exists()).toBe(false)
  })

  it('shows no results message when query matches nothing', async () => {
    const wrapper = mountComponent()
    const input = wrapper.find('input.font-search-input')
    await input.trigger('focus')
    await input.setValue('ZZZ')
    expect(wrapper.find('.font-dropdown-empty').exists()).toBe(true)
  })
})
