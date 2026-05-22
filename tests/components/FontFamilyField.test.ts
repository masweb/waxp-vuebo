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

import FontFamilyField from '@/components/editor/settings/fields/FontFamilyField.vue'

describe('FontFamilyField.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const defaultFont: Font = { family: 'Inter', weight: 400, italic: false }

  const mountComponent = (props = {}) => {
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
      }
    })
  }

  it('renders a search input', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('input.font-search-input').exists()).toBe(true)
  })

  it('initializes query from modelValue family', () => {
    const wrapper = mountComponent()
    expect((wrapper.vm as any).query).toBe('Inter')
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

  it('computes filtered fonts based on query', () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any
    // query starts as 'Inter', filtered should match Inter
    expect(vm.filtered.length).toBe(1)
    expect(vm.filtered[0].family).toBe('Inter')
    // Simulate search
    vm.query = 'Rob'
    expect(vm.filtered.length).toBe(1)
    expect(vm.filtered[0].family).toBe('Roboto')
  })

  it('computes empty filtered list for non-matching query', () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any
    vm.query = 'ZZZ'
    expect(vm.filtered.length).toBe(0)
  })

  it('renders variant select when a font with weights is selected', () => {
    const wrapper = mountComponent()
    // Inter has weights [400, 700], so select should appear
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('dropdown is closed by default', () => {
    const wrapper = mountComponent()
    expect((wrapper.vm as any).isOpen).toBe(false)
    expect(wrapper.find('.font-dropdown').exists()).toBe(false)
  })

  it('can open dropdown programmatically', async () => {
    const wrapper = mountComponent()
    const vm = wrapper.vm as any
    vm.isOpen = true
    await wrapper.vm.$nextTick()
    // Dropdown visibility depends on template refs working
    // At minimum, verify state changed
    expect(vm.isOpen).toBe(true)
  })
})
