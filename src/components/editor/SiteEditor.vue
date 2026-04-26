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
  const accentColor = opts.darkMode ? opts.darkAccentColor : opts.lightAccentColor
  const scrollbarThumb = color
  const scrollbarTrack = bgColor
  const toolColor = opts.darkMode ? '#bf7680' : '#abbbc5'
  const toolColorHover = opts.darkMode ? '#b94c47' : '#93a4ae'
  const gf = opts.globalFontFamily
  const fs = computedStyles.value
  const finalFontSize = fs ? fs.fontSize : opts.fontSize + 'em'
  const finalLineHeight = fs ? fs.lineHeight : opts.lineHeight + 'em'
  const fStyle = gf.italic ? 'italic' : 'normal'

  const headers = opts.headers
    ? Object.entries(opts.headers)
        .map(([level, cfg]) => {
          const fs = cfg.italic ? 'italic' : 'normal'
          const lh = cfg.lineHeight ?? cfg.size
          return `.site-editor .tiptap ${level.toLowerCase()} { font-size: ${cfg.size}em; line-height: ${lh}em; font-family: '${cfg.family}', sans-serif; font-weight: ${cfg.weight}; font-style: ${fs}; }`
        })
        .join('\n')
    : ''

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
  --se-scrollbar-thumb: ${scrollbarThumb};
  --se-scrollbar-track: ${scrollbarTrack};
  --se-desktop-width: ${opts.desktopWidth}px;
  --se-accent-color: ${accentColor};
}
.site-editor .tiptap a { color: var(--se-accent-color); }
${headers}`
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
    <RouterView :key="$route.fullPath" />
  </div>
</template>
