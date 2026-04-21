<script lang="ts" setup>
import { IconSettingsFilled } from '@tabler/icons-vue'
const props = defineProps<{
  section: Section
  fixed?: boolean
}>()
const st = siteStore()
const vp = viewportStore()

const pg = pageStore()
const { sectionRef, canvasRef, gridStyle, hovered, shouldShow, shouldShowBlocks } = useSectionGrid(() => props.section)

useNewBlock(sectionRef, () => props.section)

const sectionTargetWidth = computed(() => props.section.style.maxWidth ?? st.site?.options.desktopWidth)

const { computedStyles: sectionFontStyles } = useFontSize(
  () => sectionTargetWidth.value,
  () => props.section.style.fullWidth
)

const { mode } = storeToRefs(vp)

const backgroundStyle = useBackgroundStyles(
  () => props.section.style.background,
  () => (st.site?.options.darkMode ? 'dark' : 'light'),
  () => mode.value
)

const rowBackgroundStyle = useBackgroundStyles(
  () => props.section.style.section_background ?? undefined,
  () => (st.site?.options.darkMode ? 'dark' : 'light'),
  () => mode.value
)

const sectionSettings = () => {
  pg.setActiveSection(props.section.id)
  settingsStore().setSetting('SectionSettings')
}

const sectionWidth = computed(() => {
  if (props.section.style.fullWidth) return ''
  if (props.section.style.maxWidth) return 'max-width: ' + props.section.style.maxWidth + 'px;'
  return 'max-width: ' + st.site?.options.desktopWidth + 'px;'
})

const sectionFontVars = computed(() => {
  const fs = sectionFontStyles.value
  if (!fs) return ''
  return `font-size: ${fs.fontSize}; line-height: ${fs.lineHeight};`
})

const sectionPadding = computed(() => {
  const p = props.section.style.padding
  if (!p) return ''
  return `padding: ${p.t} ${p.r} ${p.b} ${p.l};`
})

const sectionMargin = computed(() => {
  const m = props.section.style.margin
  if (!m) return ''
  return `margin: ${m.t} ${m.r} ${m.b} ${m.l};`
})
</script>

<template>
  <div class="section-row-wrapper" :style="[rowBackgroundStyle.style, sectionMargin]">
    <div v-if="rowBackgroundStyle.overlay" class="section-bg-overlay" :style="rowBackgroundStyle.overlay" />
    <div
      ref="sectionRef"
      class="section"
      :class="{
        'section--hovered': hovered,
        'section--show-grid': shouldShow,
        'section--show-blocks': shouldShowBlocks
      }"
      :style="[gridStyle, sectionWidth, sectionFontVars, backgroundStyle.style, sectionPadding]"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <canvas ref="canvasRef" class="section-canvas" />
      <div v-if="backgroundStyle.overlay" class="section-bg-overlay" :style="backgroundStyle.overlay" />
      <PageBlock v-for="block in section.blocks" :key="block.id" :block="block" :section="section" />
      <DrawingOverlay :section="section" :grid-style="gridStyle" />
    </div>
  </div>

  <NewSection v-if="!fixed" :section="section" />
</template>
