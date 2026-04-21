<script lang="ts" setup>
import { IconSunFilled, IconMoonFilled } from '@tabler/icons-vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const st = siteStore()

const isDark = computed(() => !!st.site?.options.darkMode)

const toggleDarkMode = () => {
  if (st.site?.options) {
    st.site.options.darkMode = !st.site.options.darkMode
  }
}

const iconSize = computed(() => {
  const fs = textStyle.value?.['font-size']
  if (fs) {
    if (fs.endsWith('px')) return parseFloat(fs)
    if (fs.endsWith('em')) return Math.round(parseFloat(fs) * 16)
    return parseFloat(fs) || 24
  }
  const base = st.site?.options.fontSize ?? 1
  return Math.round(base * 24)
})

const iconColor = computed(() => {
  if (textStyle.value?.['color']) return textStyle.value['color']
  const opts = st.site?.options
  return isDark.value ? opts?.darkColor : opts?.lightColor
})
</script>

<template>
  <div ref="blockRef" class="block darkmode-block" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <button class="darkmode-toggle" :style="{ color: iconColor }" @click.stop="toggleDarkMode">
      <IconMoonFilled v-if="!isDark" :size="iconSize" />
      <IconSunFilled v-else :size="iconSize" />
    </button>
    <div class="blockui resize"></div>
  </div>
</template>

<style scoped>
.darkmode-block {
  display: flex;
  align-items: center;
  justify-content: center;
}

.darkmode-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
</style>
