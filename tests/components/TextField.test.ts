import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k })
}))

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

import TextField from '@/components/editor/settings/fields/TextField.vue'

describe('TextField.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(TextField, {
      props: {
        modelValue: 'hello',
        ...props
      },
      global: {}
    })
  }

  it('renders a text input', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('displays the current modelValue in the input', () => {
    const wrapper = mountComponent({ modelValue: 'test value' })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('test value')
  })

  it('renders a label when provided', () => {
    const wrapper = mountComponent({ label: 'Name' })
    expect(wrapper.find('label').text()).toBe('Name')
  })

  it('does not render a label when not provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('uses placeholder when provided', () => {
    const wrapper = mountComponent({ placeholder: 'Enter text...' })
    expect((wrapper.find('input').element as HTMLInputElement).placeholder).toBe('Enter text...')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mountComponent({ modelValue: '' })
    await wrapper.find('input').setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('new value')
  })

  it('updates input value when prop changes', async () => {
    const wrapper = mountComponent({ modelValue: 'old' })
    await wrapper.setProps({ modelValue: 'updated' })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('updated')
  })

  it('renders with empty modelValue', () => {
    const wrapper = mountComponent({ modelValue: '' })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })
})
