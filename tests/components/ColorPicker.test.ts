import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock the external ColorPicker dependency
vi.mock('@/deps/colorpicker/colorpicker.min.js', () => {
  return {
    default: class MockColorPicker {
      on = vi.fn()
      destroy = vi.fn()
      setColor = vi.fn()
    }
  }
})
vi.mock('@/deps/colorpicker/colorpicker.min.css', () => ({}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k })
}))

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

import ColorPickerField from '@/components/editor/settings/fields/ColorPicker.vue'

describe('ColorPicker.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(ColorPickerField, {
      props: {
        ...props
      },
      global: {}
    })
  }

  it('renders a hidden input', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(true)
  })

  it('renders a label when provided', () => {
    const wrapper = mountComponent({ label: 'Background Color' })
    expect(wrapper.find('label').text()).toBe('Background Color')
  })

  it('does not render a label when not provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('has a unique input id generated from useId', () => {
    const wrapper = mountComponent()
    const input = wrapper.find('input')
    const id = input.attributes('id')
    expect(id).toBeTruthy()
    expect(id).toMatch(/^cp-/)
  })

  it('renders wrapper with flex class when label is provided', () => {
    const wrapper = mountComponent({ label: 'Color' })
    const div = wrapper.find('div')
    expect(div.classes()).toContain('d-flex')
    expect(div.classes()).toContain('justify-content-between')
    expect(div.classes()).toContain('align-items-center')
  })

  it('does not apply flex wrapper class when no label', () => {
    const wrapper = mountComponent()
    const root = wrapper.find('div')
    // When no label, there's no flex class
    expect(root.classes()).not.toContain('d-flex')
  })
})
