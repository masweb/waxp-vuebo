import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLanguageName, getAllLanguages, getLanguageNames } from '@/i18n/reference/languages'
import { getCountryName, getAllCountries, getCountryNames } from '@/i18n/reference/countries'

export const useReferenceData = () => {
  const { locale } = useI18n()

  const languageName = (code: string) => getLanguageName(code, locale.value)

  const countryName = (code: string) => getCountryName(code, locale.value)

  const languages = computed(() => getAllLanguages(locale.value))

  const countries = computed(() => getAllCountries(locale.value))

  const languageNames = computed(() => getLanguageNames(locale.value))

  const countryNames = computed(() => getCountryNames(locale.value))

  return {
    languageName,
    countryName,
    languages,
    countries,
    languageNames,
    countryNames
  }
}
