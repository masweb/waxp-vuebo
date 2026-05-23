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
  IconBorderAll,
  IconWorldLongitude
} from '@tabler/icons-vue'

const { isDemo } = useDemoMode()

const isTranslating = ref(false)

const translatePageAction = async () => {
  if (!site.value || !pg.page || !auth.token || isTranslating.value) return

  isTranslating.value = true
  try {
    await useApi(`/api/sites/${site.value.id}/pages/${pg.page.id}/translate`, {
      method: 'POST',
      body: {
        reference_locale: pg.currentLocale,
        languages: site.value.locales.map(l => ({
          code: l.code,
          is_default: l.is_default ?? false
        }))
      }
    })
  } catch {
  } finally {
    isTranslating.value = false
  }
}

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

const viewportModes: { mode: ViewportMode; icon: Component }[] = [
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
      <button @click="backToDashboard()" class="btn btn-sm btn-link" aria-label="Dashboard">
        <IconLayoutDashboardFilled :size="24" />
      </button>
      <button v-if="!site?.options" @click="nav.main = 'settings'" class="btn btn-sm btn-link" aria-label="Settings">
        <IconSettingsFilled :size="24" />
      </button>
      <template v-if="site?.options">
        <button @click="stt.setSetting('SiteSettings')" class="btn btn-sm btn-link" aria-label="Site settings">
          <IconWorldFilled :size="24" />
        </button>
        <button @click="stt.setSetting('RoutingSettings')" class="btn btn-sm btn-link" aria-label="Routing settings">
          <IconSitemapFilled :size="24" />
        </button>
        <button @click="stt.setSetting('PageSettings')" class="btn btn-sm btn-link" aria-label="Page settings">
          <IconFileFilled :size="24" />
        </button>
        <div class="border-start">
          <button @click="toggleSiteDarkMode" class="btn btn-sm btn-link" aria-label="Toggle dark mode">
            <IconSunHighFilled v-if="site.options.darkMode" :size="24" />
            <IconMoonFilled v-else :size="24" />
          </button>
        </div>

        <button @click="toggleGridVisibility" class="btn btn-sm btn-link" :class="{ active: vp.showGrids }" aria-label="Toggle grid">
          <IconLayoutGridFilled :size="24" />
        </button>
        <button @click="toggleBlockVisibility" class="btn btn-sm btn-link" :class="{ active: vp.showBlocks }" aria-label="Toggle block outlines">
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
            <component :is="vm.icon" :size="20" :aria-label="vm.mode === 'mobile' ? 'Mobile viewport' : 'Tablet viewport'" />
          </button>
        </div>
      </template>
    </div>

    <EditorToolbar />

    <div class="d-flex align-items-center">
      <template v-if="site?.options">
        <button class="btn btn-sm btn-link pe-3" :disabled="!canUndo" @click="hs.undo()" aria-label="Undo">
          <IconArrowBackUp :size="24" stroke-width="2.2" />
        </button>
        <button class="btn btn-sm btn-link pe-3" :disabled="!canRedo" @click="hs.redo()" aria-label="Redo">
          <IconArrowForward :size="24" stroke-width="2.2" />
        </button>
        <button v-if="!isDemo" @click="updateAll()" class="btn btn-sm btn-link pe-3" :disabled="!canUndo" aria-label="Save">
          <IconDeviceFloppyFilled :size="24" stroke-width="2.2" />
        </button>
      </template>
      <div v-if="!isDemo && site?.locales?.length > 1" class="border-start">
        <button
          @click="translatePageAction"
          class="btn btn-sm btn-link pe-3"
          :disabled="isTranslating"
          :title="isTranslating ? 'Traduciendo página...' : 'Traducir página'"
          aria-label="Translate page"
        >
          <IconWorldLongitude :size="24" :class="{ 'spin-anim': isTranslating }" />
        </button>
      </div>
      <button @click="auth.logout()" class="btn btn-sm btn-link pe-3" aria-label="Logout">
        <IconPower :size="24" stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.spin-anim {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
