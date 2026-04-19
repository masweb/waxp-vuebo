<script setup lang="ts">
import SettingsPane from './SettingsPane.vue'

const store = siteStore()
const vp = viewportStore()
const { init, loadSiteFonts } = useGoogleFonts()

const { computedStyles } = useFontSize(() => vp.desktopWidth)

const dynamicStyle = computed(() => {
  const opts = store.site?.options
  if (!opts) return ''
  const color = opts.darkMode ? opts.darkColor : opts.lightColor
  const bgColor = opts.darkMode ? opts.darkBackColor : opts.lightBackColor
  const toolColor = opts.darkMode ? '#804244' : '#abbbc5'
  const toolColorHover = opts.darkMode ? '#b94c47' : '#93a4ae'
  const gf = opts.globalFontFamily
  const fs = computedStyles.value
  const finalFontSize = fs ? fs.fontSize : opts.fontSize + 'em'
  const finalLineHeight = fs ? fs.lineHeight : opts.lineHeight + 'em'
  const fStyle = gf.italic ? 'italic' : 'normal'

  return `.site-editor {
  --se-font-family: '${gf.family}', sans-serif;
  --se-font-size: ${finalFontSize};
  --se-line-height: ${finalLineHeight};
  --se-font-style: ${fStyle};
  --se-font-weight: ${gf.weight};
  --se-color: ${color};
  --se-bg-color: ${bgColor};
  --se-tool-color: ${toolColor};
  --se-tool-color-hover: ${toolColorHover};
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
