<script lang="ts" setup>
import { IconSettingsFilled, IconTrashFilled, IconArrowBigUpFilled, IconArrowBigDownFilled } from '@tabler/icons-vue'

const props = defineProps<{
  section: Section
  fixed?: boolean
}>()
const stt = settingsStore()
const st = siteStore()
const vp = viewportStore()

const pg = pageStore()
const hs = historyStore()
const { deactivate } = useTipTap()
const { sectionRef, canvasRef, gridStyle, hovered, shouldShow, shouldShowBlocks } = useSectionGrid(() => props.section)

useNewBlock(sectionRef, () => props.section)

const sectionTargetWidth = computed(() =>
  props.section.style.maxWidth ?? st.site?.options.desktopWidth
)

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
  stt.setSetting('SectionSettings')
}

const sectionIndex = computed(() => pg.page?.layout.findIndex(s => s.id === props.section.id) ?? -1)
const isFirst = computed(() => sectionIndex.value === 0)
const isLast = computed(() => (pg.page ? sectionIndex.value === pg.page.layout.length - 1 : false))

const moveUp = () => {
  if (isFirst.value) return
  hs.snapshot()
  const idx = sectionIndex.value
  const layout = pg.page!.layout
  const [section] = layout.splice(idx, 1)
  layout.splice(idx - 1, 0, section)
}

const moveDown = () => {
  if (isLast.value) return
  hs.snapshot()
  const idx = sectionIndex.value
  const layout = pg.page!.layout
  const [section] = layout.splice(idx, 1)
  layout.splice(idx + 1, 0, section)
}

const deleteSection = () => {
  const hasActiveBlock = pg.activeBlock && props.section.blocks.some(b => b.id === pg.activeBlock!.id)
  if (hasActiveBlock) deactivate()
  hs.snapshot()
  const idx = pg.page!.layout.findIndex(s => s.id === props.section.id)
  if (idx !== -1) pg.page!.layout.splice(idx, 1)
  pg.setActiveBlock(null)
  if (pg.activeSection?.id === props.section.id) pg.activeSection = null
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
      :class="{ 'section--hovered': hovered, 'section--show-grid': shouldShow, 'section--show-blocks': shouldShowBlocks }"
      :style="[gridStyle, sectionWidth, sectionFontVars, backgroundStyle.style, sectionPadding]"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <canvas ref="canvasRef" class="section-canvas" />
      <div v-if="backgroundStyle.overlay" class="section-bg-overlay" :style="backgroundStyle.overlay" />
      <PageBlock v-for="block in section.blocks" :key="block.id" :block="block" :section="section" />
      <DrawingOverlay :section="section" :grid-style="gridStyle" />
      <button v-if="!fixed" class="btn btn-sm sectionui moveup" :disabled="isFirst" @click="moveUp">
        <IconArrowBigUpFilled size="22" />
      </button>
      <button v-if="!fixed" class="btn btn-sm sectionui movedown" :disabled="isLast" @click="moveDown">
        <IconArrowBigDownFilled size="22" />
      </button>
      <button @click="sectionSettings()" class="btn btn-sm sectionui config">
        <IconSettingsFilled size="22" />
      </button>
      <button v-if="!fixed" class="btn btn-sm sectionui delete" @click="deleteSection">
        <IconTrashFilled size="22" />
      </button>
    </div>
  </div>

  <NewSection v-if="!fixed" :section="section" />
</template>
