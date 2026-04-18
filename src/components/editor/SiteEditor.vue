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
  let finalFontSize = opts.fontSize
  let finalLineHeight = opts.lineHeight
  let fStyle = 'normal'
  if (vp.mode == 'desktop' && vp.desktopWidth >= vp.width) {
    const factor = 1.491 - 0.000965 * vp.desktopWidth
    finalFontSize = finalFontSize + factor + 'vw'
    finalLineHeight = finalLineHeight + factor + 'vw'
  } else if (vp.mode == 'tablet') {
    finalFontSize = finalFontSize + 0.933 + 'vw'
    finalLineHeight = finalLineHeight + 0.933 + 'vw'
  } else if (vp.mode == 'mobile') {
    finalFontSize = finalFontSize + 3 + 'vw'
    finalLineHeight = finalLineHeight + 3 + 'vw'
  } else {
    finalFontSize = opts.fontSize + 'em'
    finalLineHeight = opts.lineHeight + 'em'
  }
  if (gf.italic) fStyle = 'italic'

  return `.site-editor {
  --se-font-family: '${gf.family}', sans-serif;
  --se-font-size: ${finalFontSize};
  --se-line-height: ${finalLineHeight};
  --se-font-style: ${fStyle};
  --se-font-weight: ${gf.weight};
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
