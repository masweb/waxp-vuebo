import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

// Stub CoreUI's CFormRange component
const CFormRange = {
  template: '<input type="range" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue', 'min', 'max', 'step'],
  emits: ['update:modelValue']
}

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k })
}))

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

// Import after mocks
import NumberRange from '@/components/editor/settings/fields/NumberRange.vue'

describe('NumberRange.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(NumberRange, {
      props: {
        modelValue: 10,
        ...props
      },
      global: {
        stubs: { CFormRange }
      }
    })
  }

  it('renders a range input and a number input', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('input[type="range"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
  })

  it('displays the current modelValue in the number input', () => {
    const wrapper = mountComponent({ modelValue: 25 })
    const numberInput = wrapper.find('input[type="number"]')
    expect((numberInput.element as HTMLInputElement).value).toBe('25')
  })

  it('renders a label when provided', () => {
    const wrapper = mountComponent({ label: 'Font Size' })
    expect(wrapper.find('label').text()).toBe('Font Size')
  })

  it('does not render a label when not provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('emits update:modelValue when number input changes', async () => {
    const wrapper = mountComponent({ modelValue: 5 })
    const numberInput = wrapper.find('input[type="number"]')
    await numberInput.setValue('20')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')!.at(-1)![0]).toBe(20)
  })

  it('uses default min, max, step values', () => {
    const wrapper = mountComponent()
    const numberInput = wrapper.find('input[type="number"]')
    expect((numberInput.element as HTMLInputElement).min).toBe('1')
    expect((numberInput.element as HTMLInputElement).max).toBe('48')
    expect((numberInput.element as HTMLInputElement).step).toBe('1')
  })

  it('uses custom min, max, step when provided', () => {
    const wrapper = mountComponent({ min: 0, max: 100, step: 5 })
    const numberInput = wrapper.find('input[type="number"]')
    expect((numberInput.element as HTMLInputElement).min).toBe('0')
    expect((numberInput.element as HTMLInputElement).max).toBe('100')
    expect((numberInput.element as HTMLInputElement).step).toBe('5')
  })

  it('updates local value when prop changes', async () => {
    const wrapper = mountComponent({ modelValue: 10 })
    await wrapper.setProps({ modelValue: 30 })
    const numberInput = wrapper.find('input[type="number"]')
    expect((numberInput.element as HTMLInputElement).value).toBe('30')
  })
})
