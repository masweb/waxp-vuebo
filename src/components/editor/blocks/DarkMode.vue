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

const iconStyle = computed(() => {
  const s: Record<string, string> = {}
  if (textStyle.value?.['font-size']) s['font-size'] = textStyle.value['font-size']
  if (textStyle.value?.['color']) {
    s['color'] = textStyle.value['color']
  } else {
    const opts = st.site?.options
    s['color'] = isDark.value ? (opts?.darkColor ?? '') : (opts?.lightColor ?? '')
  }
  return s
})
</script>

<template>
  <div ref="blockRef" class="block darkmode-block" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <button class="darkmode-toggle" :style="iconStyle" @click.stop="toggleDarkMode">
      <IconMoonFilled v-if="!isDark" :size="'1em'" />
      <IconSunFilled v-else :size="'1em'" />
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
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
