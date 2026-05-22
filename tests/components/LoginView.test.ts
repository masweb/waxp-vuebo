import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: 'es' } })
}))

// Mock useApi
vi.mock('@/composables/useApi', () => ({
  useApi: vi.fn()
}))

// Mock useValidation composable
vi.mock('@/composables/useValidation', () => ({
  useValidation: () => ({
    emailRule: (v: string) => !v ? 'validation.required' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? true : 'validation.email',
    passwordRule: (v: string) => !v ? 'validation.required' : v.length < 6 ? 'validation.password.min' : true
  })
}))

// Mock tabler icons
vi.mock('@tabler/icons-vue', () => ({
  IconEye: { template: '<svg data-testid="icon-eye" />' },
  IconEyeClosed: { template: '<svg data-testid="icon-eye-closed" />' }
}))

// Mock the useAuthStore
const mockLogin = vi.fn()
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    loading: { value: false },
    login: mockLogin,
    isAuthenticated: false,
    initializeAuth: vi.fn()
  }))
}))

// Mock navigationStore
vi.mock('@/stores/appNavigationStore', () => ({
  navigationStore: vi.fn(() => ({ main: 'dashboard' }))
}))

// Mock siteStore
vi.mock('@/stores/siteStore', () => ({
  siteStore: vi.fn(() => ({
    site: null,
    REACT401: 0
  }))
}))

import LoginView from '@/views/auth/LoginView.vue'

describe('LoginView.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    mockLogin.mockClear()
  })

  const mountComponent = () => {
    return mount(LoginView, {
      global: {
        plugins: [pinia],
        stubs: {}
      }
    })
  }

  it('renders the login form', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders email input', () => {
    const wrapper = mountComponent()
    const emailInput = wrapper.find('#email')
    expect(emailInput.exists()).toBe(true)
    expect(emailInput.attributes('type')).toBe('email')
  })

  it('renders password input', () => {
    const wrapper = mountComponent()
    const passwordInput = wrapper.find('#password')
    expect(passwordInput.exists()).toBe(true)
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('renders submit button', () => {
    const wrapper = mountComponent()
    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.exists()).toBe(true)
    expect(submitBtn.text()).toContain('submit')
  })

  it('renders the logo text', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.logo').text()).toBe('w a x p')
  })

  it('has a card header with login title', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.card-header').text()).toBe('login')
  })

  it('renders password visibility toggle button', () => {
    const wrapper = mountComponent()
    const toggleBtn = wrapper.find('button[type="button"]')
    expect(toggleBtn.exists()).toBe(true)
  })

  it('shows eye icon when password is hidden', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-testid="icon-eye"]').exists()).toBe(true)
  })

  it('toggles password visibility on button click', async () => {
    const wrapper = mountComponent()
    const toggleBtn = wrapper.find('button[type="button"]')
    await toggleBtn.trigger('click')

    // After toggle, password input should be type="text"
    const passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('text')

    // EyeClosed icon should be shown now
    expect(wrapper.find('[data-testid="icon-eye-closed"]').exists()).toBe(true)
  })

  it('renders email input with default value', () => {
    const wrapper = mountComponent()
    const emailInput = wrapper.find('#email')
    expect((emailInput.element as HTMLInputElement).value).toBe('admin@waxp.com')
  })

  it('renders password input with default value', () => {
    const wrapper = mountComponent()
    const passwordInput = wrapper.find('#password')
    expect((passwordInput.element as HTMLInputElement).value).toBe('Admin123!')
  })

  it('has email placeholder', () => {
    const wrapper = mountComponent()
    const emailInput = wrapper.find('#email')
    expect(emailInput.attributes('placeholder')).toBe('email')
  })

  it('has password placeholder', () => {
    const wrapper = mountComponent()
    const passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('placeholder')).toBe('password')
  })
})
