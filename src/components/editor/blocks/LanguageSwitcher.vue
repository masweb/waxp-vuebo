<script lang="ts" setup>
import { useRouter } from 'vue-router'

const props = defineProps<{
  block: Block
  section: Section
}>()

const router = useRouter()
const st = siteStore()
const pg = pageStore()
const hs = historyStore()
const { t } = useI18n()
const { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const sectionTargetWidth = computed(() => props.section.style.maxWidth ?? st.site?.options.desktopWidth)
const { computedStyles: sectionFont } = useFontSize(() => sectionTargetWidth.value, () => props.section.style.fullWidth)

const isDark = computed(() => !!st.site?.options.darkMode)

const fluidTextStyle = computed(() => {
  const s: Record<string, string> = { ...textStyle.value }
  if (!s['font-size'] && sectionFont.value) {
    s['font-size'] = sectionFont.value.fontSize
    s['line-height'] = sectionFont.value.lineHeight
  }
  if (!s['color']) {
    const opts = st.site?.options
    s['color'] = isDark.value ? opts?.darkColor : opts?.lightColor
  }
  return s
})

const showModal = ref(false)
const pendingLocale = ref('')

const locales = computed(() => {
  const locs: any[] = st.site?.locales || []
  return locs.map(l => typeof l === 'string' ? l : l.code)
})

const sisterRouteForLocale = (loc: string) => {
  const routes = st.site?.routes?.[loc] || []
  const currentPageId = pg.page?.id
  if (currentPageId) {
    const sister = routes.find(r => r.page_id === currentPageId)
    if (sister) return sister
  }
  return routes.find(r => r.path === '/' || r.path === `/${loc}`) || null
}

const navigateToLocale = async (loc: string) => {
  const route = sisterRouteForLocale(loc)
  if (!route) return
  const routeName = `${loc}-${route.page_id}`
  if (!router.hasRoute(routeName)) return
  await router.push({ name: routeName })
}

const switchLocale = (loc: string) => {
  if (loc === pg.currentLocale) return
  if (hs.canUndo) {
    pendingLocale.value = loc
    showModal.value = true
    return
  }
  navigateToLocale(loc)
}

const saveAndSwitch = async () => {
  showModal.value = false
  await pg.updatePage(pg.currentLocale)
  await st.updateSite(pg.currentLocale)
  await navigateToLocale(pendingLocale.value)
}

const discardAndSwitch = async () => {
  showModal.value = false
  await navigateToLocale(pendingLocale.value)
}

const cancelSwitch = () => {
  showModal.value = false
  pendingLocale.value = ''
}
</script>

<template>
  <div ref="blockRef" class="block lang-switcher" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <select
      class="form-select form-select-sm lang-select"
      :value="pg.currentLocale"
      :style="fluidTextStyle"
      @change="switchLocale(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="loc in locales" :key="loc" :value="loc">{{ loc.toUpperCase() }}</option>
    </select>
    <div class="blockui resize"></div>
  </div>

  <Teleport to="body">
    <div v-if="showModal" class="lang-modal-backdrop" @click.self="cancelSwitch">
      <div class="lang-modal">
        <div class="lang-modal-header">
          <strong>{{ t('pages.unsavedChanges') }}</strong>
        </div>
        <div class="lang-modal-body">
          {{ t('pages.unsavedChangesDesc') }}
        </div>
        <div class="lang-modal-footer">
          <button class="btn btn-sm btn-outline-secondary" @click="cancelSwitch">{{ t('common.cancel') }}</button>
          <button class="btn btn-sm btn-outline-danger" @click="discardAndSwitch">{{ t('pages.discardChanges') }}</button>
          <button class="btn btn-sm btn-primary" @click="saveAndSwitch">{{ t('common.save') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.lang-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.lang-modal {
  background: var(--cui-body-bg, #fff);
  color: var(--cui-body-color, #333);
  border-radius: 0.5rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
  width: 400px;
  max-width: 90vw;
}

.lang-modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--cui-border-color, #dee2e6);
}

.lang-modal-body {
  padding: 1rem;
}

.lang-modal-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--cui-border-color, #dee2e6);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
}

.lang-select {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0 0.5rem;
  outline: none;
  box-shadow: none;
  cursor: pointer;
  text-align: center;
  text-align-last: center;
}
</style>
