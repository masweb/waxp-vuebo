<script setup lang="ts">
const { theme, setTheme } = useTheme()
const { locale, availableLocales, t } = useI18n()
const auth = useAuthStore()
const nav = navigationStore()

watch(locale, newLocale => localStorage.setItem('lang', newLocale))
import { IconPower, IconSettingsFilled, IconLayoutDashboardFilled } from '@tabler/icons-vue'
</script>

<template>
  <div v-if="auth.isAuthenticated" class="main-bar d-flex">
    <div class="d-flex align-items-center">
      <button @click="nav.main = 'dashboard'" class="btn btn-sm btn-link">
        <IconLayoutDashboardFilled :size="24" stroke-width="1.2" />
      </button>
      <button @click="nav.main = 'settings'" class="btn btn-sm btn-link">
        <IconSettingsFilled :size="24" stroke-width="1.2" />
      </button>
    </div>
    <ErrorsNotifier />
    <div class="d-flex align-items-center">
      <button @click="auth.logout()" class="btn btn-sm btn-link pe-3">
        <IconPower :size="24" stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>
