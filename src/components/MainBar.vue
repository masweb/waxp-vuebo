<script setup lang="ts">
import {
  IconPower,
  IconSettingsFilled,
  IconLayoutDashboardFilled,
  IconFileFilled,
  IconSitemapFilled,
  IconSunHighFilled,
  IconMoonFilled
} from '@tabler/icons-vue'
import { clearRoutes } from '@/router'

const auth = useAuthStore()
const nav = navigationStore()
const st = siteStore()
const stt = settingsStore()

const { site } = storeToRefs(st)

const toggleSiteDarkMode = () => {
  if (!site.value?.options) return
  site.value.options.darkMode = !site.value.options.darkMode
}

const backToDashboard = () => {
  st.closeSite()
  nav.setView('dashboard')
}
</script>

<template>
  <div v-if="auth.isAuthenticated" class="main-bar d-flex">
    <div class="d-flex align-items-center">
      <button @click="backToDashboard()" class="btn btn-sm btn-link">
        <IconLayoutDashboardFilled :size="24" />
      </button>
      <button v-if="!site?.options" @click="nav.main = 'settings'" class="btn btn-sm btn-link">
        <IconSettingsFilled :size="24" />
      </button>
      <template v-if="site?.options">
        <button @click="stt.setSetting('SiteSettings')" class="btn btn-sm btn-link">
          <IconFileFilled :size="24" />
        </button>
        <button @click="stt.setSetting('RoutingSettings')" class="btn btn-sm btn-link">
          <IconSitemapFilled :size="24" />
        </button>
        <button @click="toggleSiteDarkMode" class="btn btn-sm btn-link">
          <IconSunHighFilled v-if="site.options.darkMode" :size="24" />
          <IconMoonFilled v-else :size="24" />
        </button>
      </template>
    </div>
    <ErrorsNotifier />
    <div class="d-flex align-items-center">
      <button @click="auth.logout()" class="btn btn-sm btn-link pe-3">
        <IconPower :size="24" stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>
