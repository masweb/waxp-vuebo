import { useI18n } from 'vue-i18n'

export const useValidation = () => {
  const { t } = useI18n()

  const emailRule = (value: string) => {
    if (!value) {
      return t('validation.required')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return t('validation.email')
    }
    return true
  }

  const passwordRule = (value: string) => {
    if (!value) {
      return t('validation.required')
    }

    if (value.length < 6) {
      return t('validation.password.min')
    }

    if (!/[a-z]/.test(value)) {
      return t('validation.password.lowercase')
    }

    if (!/[A-Z]/.test(value)) {
      return t('validation.password.uppercase')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return t('validation.password.symbol')
    }

    return true
  }

  return {
    emailRule,
    passwordRule
  }
}
