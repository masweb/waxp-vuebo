<script setup lang="ts">
import {
  IconPower,
  IconSettingsFilled,
  IconLayoutDashboardFilled,
  IconFileFilled,
  IconSitemapFilled,
  IconSunHighFilled,
  IconMoonFilled,
  IconLayoutGridFilled,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceFloppy,
  IconDeviceFloppyFilled,
  IconArrowBackUp,
  IconArrowForward
} from '@tabler/icons-vue'

const auth = useAuthStore()
const nav = navigationStore()
const st = siteStore()
const stt = settingsStore()
const pg = pageStore()

const { site } = storeToRefs(st)

const vp = viewportStore()
const toggleGridVisibility = () => (vp.showGrids = !vp.showGrids)

const viewportModes: { mode: ViewportMode; icon: any }[] = [
  { mode: 'mobile', icon: IconDeviceMobile },
  { mode: 'tablet', icon: IconDeviceTablet },
  { mode: 'desktop', icon: IconDeviceDesktop }
]

const toggleViewportMode = (mode: ViewportMode) => {
  vp.forcedMode = vp.forcedMode === mode ? null : mode
}

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
        <button @click="toggleGridVisibility" class="btn btn-sm btn-link" :class="{ active: vp.showGrids }">
          <IconLayoutGridFilled :size="24" />
        </button>
        <div class="d-flex align-items-center ms-1 border-start ps-1">
          <button
            v-for="vm in viewportModes"
            :key="vm.mode"
            @click="toggleViewportMode(vm.mode)"
            class="btn btn-sm btn-link"
            :class="{ active: vp.forcedMode === vm.mode }"
          >
            <component :is="vm.icon" :size="20" />
          </button>
        </div>
      </template>
    </div>
    <ErrorsNotifier />
    <div class="d-flex align-items-center">
      <button class="btn btn-sm btn-link pe-3">
        <IconArrowBackUp :size="24" stroke-width="2.2" />
      </button>
      <button class="btn btn-sm btn-link pe-3">
        <IconArrowForward :size="24" stroke-width="2.2" />
      </button>
      <button @click="pg.updatePage()" class="btn btn-sm btn-link pe-3">
        <IconDeviceFloppyFilled :size="24" stroke-width="2.2" />
      </button>
      <button @click="auth.logout()" class="btn btn-sm btn-link pe-3">
        <IconPower :size="24" stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>
