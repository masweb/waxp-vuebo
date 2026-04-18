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
  const toolColor = opts.darkMode ? '#804244' : '#abbbc5'
  const toolColorHover = opts.darkMode ? '#b94c47' : '#93a4ae'
  const gf = opts.globalFontFamily
  let finalFontSize: string | number = opts.fontSize
  let finalLineHeight: string | number = opts.lineHeight
  let fStyle = 'normal'

  const toPx = (base: number, vwAdd: number, width: number) =>
    (base + vwAdd) * width / 100 + 'px'

  if (vp.mode == 'desktop' && (vp.forcedMode == 'desktop' || (!vp.forcedMode && vp.desktopWidth >= vp.width))) {
    const factor = 1.491 - 0.000965 * vp.desktopWidth
    const targetWidth = vp.forcedMode ? vp.desktopWidth : vp.width
    finalFontSize = toPx(opts.fontSize, factor, targetWidth)
    finalLineHeight = toPx(opts.lineHeight, factor, targetWidth)
  } else if (vp.mode == 'tablet' || vp.forcedMode == 'tablet') {
    const targetWidth = vp.forcedMode ? 820 : vp.width
    finalFontSize = toPx(opts.fontSize, 0.933, targetWidth)
    finalLineHeight = toPx(opts.lineHeight, 0.933, targetWidth)
  } else if (vp.mode == 'mobile' || vp.forcedMode == 'mobile') {
    const targetWidth = vp.forcedMode ? 480 : vp.width
    finalFontSize = toPx(opts.fontSize, 3, targetWidth)
    finalLineHeight = toPx(opts.lineHeight, 3, targetWidth)
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
