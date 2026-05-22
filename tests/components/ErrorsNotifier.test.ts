import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ErrorsNotifier from '@/components/ErrorsNotifier.vue'

// Mock vue-i18n auto-import
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: 'es' } })
}))

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

describe('ErrorsNotifier.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountComponent = () => {
    return mount(ErrorsNotifier, {
      global: {
        plugins: [pinia],
        stubs: {}
      }
    })
  }

  it('renders nothing when there are no errors', () => {
    const wrapper = mountComponent()
    expect(wrapper.findAll('.text-danger')).toHaveLength(0)
    expect(wrapper.text()).toBe('')
  })

  it('renders error items when errors exist', () => {
    const store = errorsStore()
    store.addError({ error: 'Something went wrong', code: 400 })

    const wrapper = mountComponent()
    const items = wrapper.findAll('.text-danger')
    expect(items).toHaveLength(1)
  })

  it('displays error code and message', () => {
    const store = errorsStore()
    store.addError({ error: 'Not Found', code: 404 })

    const wrapper = mountComponent()
    const item = wrapper.find('.text-danger')
    expect(item.find('strong').text()).toBe('404')
    expect(item.find('span').text()).toBe('Not Found')
  })

  it('renders multiple errors', () => {
    const store = errorsStore()
    store.addError({ error: 'Error 1', code: 400 })
    store.addError({ error: 'Error 2', code: 500 })

    const wrapper = mountComponent()
    expect(wrapper.findAll('.text-danger')).toHaveLength(2)
  })
})
