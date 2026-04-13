<script setup lang="ts">
const { theme, setTheme } = useTheme()
const { locale, availableLocales, t } = useI18n()
const auth = useAuthStore()

watch(locale, newLocale => localStorage.setItem('lang', newLocale))
import { IconSunFilled, IconMoonFilled, IconPower } from '@tabler/icons-vue'
</script>

<template>
  <div class="main-bar d-flex">
    <div class="d-flex align-items-center">
      <div class="ms-3 fw-light text-">APP NAME</div>
    </div>
    <ErrorsNotifier />
    <div class="d-flex align-items-center">
      <button @click="auth.logout()" class="btn btn-sm btn-link pe-3">
        <IconPower :size="24" stroke-width="1.2" />
      </button>
      <select v-model="locale" class="form-select form-select-sm">
        <option v-for="lang in availableLocales" :key="lang" :value="lang">{{ lang }}</option>
      </select>
      <button
        :title="theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')"
        class="btn btn-sm btn-link pe-3"
        @click="setTheme(theme === 'dark' ? 'light' : 'dark')"
      >
        <IconSunFilled v-if="theme === 'dark'" :size="24" stroke-width="1.2" />
        <IconMoonFilled v-else :size="22" stroke-width="1.2" />
      </button>
    </div>
  </div>
</template>
