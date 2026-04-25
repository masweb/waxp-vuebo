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
  IconDeviceMobileFilled,
  IconDeviceTabletFilled,
  IconDeviceFloppyFilled,
  IconArrowBackUp,
  IconArrowForward,
  IconWorldFilled,
  IconBorderAll
} from '@tabler/icons-vue'

const auth = useAuthStore()
const nav = navigationStore()
const st = siteStore()
const stt = settingsStore()
const pg = pageStore()
const hs = historyStore()

const currentLocale = computed(() => pg.currentLocale)

const { site } = storeToRefs(st)
const { canUndo, canRedo } = storeToRefs(hs)

const vp = viewportStore()
const toggleGridVisibility = () => (vp.showGrids = !vp.showGrids)
const toggleBlockVisibility = () => (vp.showBlocks = !vp.showBlocks)

const viewportModes: { mode: ViewportMode; icon: any }[] = [
  { mode: 'mobile', icon: IconDeviceMobileFilled },
  { mode: 'tablet', icon: IconDeviceTabletFilled }
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

const onKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault()
    e.shiftKey ? hs.redo() : hs.undo()
  }
}

const updateAll = () => {
  pg.updatePage(currentLocale.value)
  st.updateSite(currentLocale.value)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
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
          <IconWorldFilled :size="24" />
        </button>
        <button @click="stt.setSetting('RoutingSettings')" class="btn btn-sm btn-link">
          <IconSitemapFilled :size="24" />
        </button>
        <button @click="stt.setSetting('PageSettings')" class="btn btn-sm btn-link">
          <IconFileFilled :size="24" />
        </button>
        <button @click="toggleSiteDarkMode" class="btn btn-sm btn-link">
          <IconSunHighFilled v-if="site.options.darkMode" :size="24" />
          <IconMoonFilled v-else :size="24" />
        </button>

        <button @click="toggleGridVisibility" class="btn btn-sm btn-link" :class="{ active: vp.showGrids }">
          <IconLayoutGridFilled :size="24" />
        </button>
        <button @click="toggleBlockVisibility" class="btn btn-sm btn-link" :class="{ active: vp.showBlocks }">
          <IconBorderAll :size="24" />
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

    <EditorToolbar />

    <div class="d-flex align-items-center">
      <template v-if="site?.options">
        <button class="btn btn-sm btn-link pe-3" :disabled="!canUndo" @click="hs.undo()">
          <IconArrowBackUp :size="24" stroke-width="2.2" />
        </button>
        <button class="btn btn-sm btn-link pe-3" :disabled="!canRedo" @click="hs.redo()">
          <IconArrowForward :size="24" stroke-width="2.2" />
        </button>
        <button @click="updateAll()" class="btn btn-sm btn-link pe-3" :disabled="!canUndo">
          <IconDeviceFloppyFilled :size="24" stroke-width="2.2" />
        </button>
      </template>
      <button @click="auth.logout()" class="btn btn-sm btn-link pe-3">
        <IconPower :size="24" stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>
