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

import SidesField from '@/components/editor/settings/fields/SidesField.vue'
import type { Sides } from '@/types/layout'

describe('SidesField.vue', () => {
  const defaultSides: Sides = { t: '10', r: '20', b: '10', l: '20' }

  const mountComponent = (props: Record<string, any> = {}) => {
    return mount(SidesField, {
      props: {
        modelValue: defaultSides,
        label: 'Padding',
        ...props
      },
      global: {
        stubs: {}
      }
    })
  }

  it('renders the label', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('label').text()).toBe('Padding')
  })

  it('renders four input fields (t, r, b, l)', () => {
    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input[type="text"]')
    expect(inputs).toHaveLength(4)
  })

  it('displays the current side values in the inputs', () => {
    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input[type="text"]')
    expect((inputs[0].element as HTMLInputElement).value).toBe('10') // t
    expect((inputs[1].element as HTMLInputElement).value).toBe('20') // r
    expect((inputs[2].element as HTMLInputElement).value).toBe('10') // b
    expect((inputs[3].element as HTMLInputElement).value).toBe('20') // l
  })

  it('emits update:modelValue when a side value changes', async () => {
    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input[type="text"]')
    await inputs[0].setValue('30')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue')![0][0] as Sides
    expect(emitted.t).toBe('30')
    expect(emitted.r).toBe('20')
    expect(emitted.b).toBe('10')
    expect(emitted.l).toBe('20')
  })

  it('preserves other sides when one changes', async () => {
    const wrapper = mountComponent({ modelValue: { t: '5', r: '10', b: '5', l: '10' } })
    const inputs = wrapper.findAll('input[type="text"]')
    await inputs[1].setValue('15')
    const emitted = wrapper.emitted('update:modelValue')![0][0] as Sides
    expect(emitted.t).toBe('5')
    expect(emitted.r).toBe('15')
    expect(emitted.b).toBe('5')
    expect(emitted.l).toBe('10')
  })
})
