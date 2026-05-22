import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Nothing from '@/components/Nothing.vue'

describe('Nothing.vue', () => {
  it('renders the text "nothing"', () => {
    const wrapper = mount(Nothing)
    expect(wrapper.text()).toBe('nothing')
  })

  it('matches snapshot', () => {
    const wrapper = mount(Nothing)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
