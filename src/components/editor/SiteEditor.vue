<script setup lang="ts">
import SettingsPane from './SettingsPane.vue'

const store = siteStore()
const { init, activateSiteFonts } = useGoogleFonts()

const dynamicStyle = computed(() => {
  const opts = store.site?.options
  if (!opts) return ''
  const color = opts.darkMode ? opts.darkColor : opts.lightColor
  const bgColor = opts.darkMode ? opts.darkBackColor : opts.lightBackColor
  return `.site-editor {
  --se-font-family: '${opts.fontFamily}', sans-serif;
  --se-font-size: ${opts.fontSize};
  --se-font-weight: ${opts.fontWeight};
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
  () => store.site?.options,
  async options => {
    if (!options) return
    await activateSiteFonts(options.fontFamily, options.fontWeight)
  },
  { immediate: true }
)
</script>

<template>
  <SettingsPane />
  <div class="site-editor">
    <component :is="'style'" v-html="dynamicStyle" />

    <RouterView />
  </div>
</template>
