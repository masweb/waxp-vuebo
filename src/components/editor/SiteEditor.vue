<script setup lang="ts">
import SettingsPane from './SettingsPane.vue'

const store = siteStore()
const vp = viewportStore()
const { init, loadSiteFonts } = useGoogleFonts()

const dynamicStyle = computed(() => {
  const opts = store.site?.options
  if (!opts) return ''
  const color = opts.darkMode ? opts.darkColor : opts.lightColor
  const bgColor = opts.darkMode ? opts.darkBackColor : opts.lightBackColor
  const gf = opts.globalFontFamily
  return `.site-editor {
  --se-font-family: '${gf.family}', sans-serif;
  --se-font-size: ${opts.fontSize};
  --se-font-weight: ${gf.weight};
  --se-line-height: ${opts.lineHeight};
  --se-color: ${color};
  --se-bg-color: ${bgColor};
  --se-desktop-width: ${opts.desktopWidth}px;
}`
})

onMounted(async () => {
  await init()
})

watch(
  () => store.site?.options?.fonts,
  fonts => {
    if (fonts) loadSiteFonts(fonts)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <SettingsPane />
  <div class="site-editor" :class="vp.forcedMode ? `sim-${vp.forcedMode}` : ''">
    <component :is="'style'" v-html="dynamicStyle" />
    <RouterView />
  </div>
</template>
