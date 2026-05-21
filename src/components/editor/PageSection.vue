<script lang="ts" setup>
import { h } from 'vue'
import {
  IconSettingsFilled,
  IconCopyFilled,
  IconClipboardFilled,
  IconArrowBigUpFilled,
  IconArrowBigDownFilled,
  IconTrashFilled,
  IconPlusFilled
} from '@tabler/icons-vue'
import ContextMenu from '@imengyu/vue3-context-menu'
import { useTheme } from '@/composables/useTheme'

const props = defineProps<{
  section: Section
  fixed?: boolean
}>()
const st = siteStore()
const vp = viewportStore()
const hs = historyStore()

const pg = pageStore()
const { effectiveTheme } = useTheme()
const { t } = useI18n()

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

const sectionIndex = computed(() => {
  if (!pg.page) return -1
  return pg.page.layout.findIndex(s => s.id === props.section.id)
})

const isFirst = computed(() => sectionIndex.value === 0)
const isLast = computed(() => (pg.page ? sectionIndex.value === pg.page.layout.length - 1 : false))

const copySection = () => {
  pg.clipboardSection = JSON.parse(JSON.stringify(props.section))
}

const moveUp = () => {
  if (isFirst.value || !pg.page) return
  hs.snapshot()
  const idx = sectionIndex.value
  const layout = pg.page.layout
  const [section] = layout.splice(idx, 1)
  layout.splice(idx - 1, 0, section)
}

const moveDown = () => {
  if (isLast.value || !pg.page) return
  hs.snapshot()
  const idx = sectionIndex.value
  const layout = pg.page.layout
  const [section] = layout.splice(idx, 1)
  layout.splice(idx + 1, 0, section)
}

const deleteSection = () => {
  if (!pg.page) return
  const hasActiveBlock = pg.activeBlock && props.section.blocks.some(b => b.id === pg.activeBlock!.id)
  if (hasActiveBlock) {
    const { deactivate } = useTipTap()
    deactivate()
  }
  hs.snapshot()
  const idx = pg.page.layout.findIndex(s => s.id === props.section.id)
  if (idx !== -1) pg.page.layout.splice(idx, 1)
  pg.setActiveBlock(null)
  if (pg.activeSection?.id === props.section.id) pg.activeSection = null
}

const addSection = async () => {
  if (!pg.page) return
  hs.snapshot()
  const resp = await useApi(`/api/sites/${st.site?.id}/sections/next-id`, { method: 'POST' })
  const newSection = createSection(resp.id)
  const insertAt = pg.page.layout.findIndex(s => s.id === props.section.id) + 1
  pg.page.layout.splice(insertAt, 0, newSection)
}

const pasteSection = async () => {
  if (!pg.page || !pg.clipboardSection) return
  hs.snapshot()
  const resp = await useApi(`/api/sites/${st.site?.id}/sections/next-id`, { method: 'POST' })
  const pasted: Section = JSON.parse(JSON.stringify(pg.clipboardSection))
  pasted.id = resp.id
  for (const block of pasted.blocks) {
    const bResp = await useApi(`/api/sites/${st.site?.id}/blocks/next-id`, { method: 'POST' })
    block.id = bResp.id
  }
  const insertAt = pg.page.layout.findIndex(s => s.id === props.section.id) + 1
  pg.page.layout.splice(insertAt, 0, pasted)
}

const pasteBlock = async () => {
  if (!pg.clipboardBlock) return
  hs.snapshot()
  const sec = props.section
  const modeKey = MODE_KEY[vp.mode]
  const { findFreeCoordsAt, ensureRows, trimRows } = useGridConversion()
  const resp = await useApi(`/api/sites/${st.site?.id}/blocks/next-id`, { method: 'POST' })
  const pasted: Block = JSON.parse(JSON.stringify(pg.clipboardBlock))
  pasted.id = resp.id

  const otherModes = (['mobile', 'tablet', 'desktop'] as ViewportMode[]).filter(m => m !== vp.mode)
  pasted[modeKey] = findFreeCoordsAt(sec, vp.mode, pg.clipboardBlock[modeKey] as BlockCoords)
  for (const mode of otherModes) {
    const key = MODE_KEY[mode]
    pasted[key] = findFreeCoordsAt(sec, mode, pasted[key] as BlockCoords)
  }

  sec.blocks.push(pasted)
  ensureRows(sec, vp.mode)
  trimRows(sec)
}

const onContextMenu = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.block')) return
  e.preventDefault()
  const theme = effectiveTheme.value === 'dark' ? 'dark' : 'default'
  const items: any[] = []

  items.push({
    label: t('contextMenu.section'),
    disabled: true,
    clickClose: false,
    preserveIconWidth: false,
    attrs: {
      style:
        'padding-top: 0; padding-bottom: 0; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.6;'
    }
  })

  items.push(
    {
      label: t('contextMenu.configure'),
      icon: h(IconSettingsFilled, { size: 16 }),
      divided: 'up',
      onClick: () => sectionSettings()
    },
    {
      label: t('newSection.copy'),
      icon: h(IconCopyFilled, { size: 16 }),
      onClick: () => copySection()
    }
  )

  if (pg.clipboardSection) {
    items.push({
      label: t('newSection.paste'),
      icon: h(IconClipboardFilled, { size: 16 }),
      onClick: () => pasteSection()
    })
  }

  if (pg.clipboardBlock) {
    items.push({
      label: t('contextMenu.pasteBlock'),
      icon: h(IconClipboardFilled, { size: 16 }),
      onClick: () => pasteBlock()
    })
  }

  if (!isFirst.value) {
    items.push({
      label: t('newSection.moveUp'),
      icon: h(IconArrowBigUpFilled, { size: 16 }),
      onClick: () => moveUp()
    })
  }

  if (!isLast.value) {
    items.push({
      label: t('newSection.moveDown'),
      icon: h(IconArrowBigDownFilled, { size: 16 }),
      onClick: () => moveDown()
    })
  }

  items.push(
    {
      label: t('newSection.delete'),
      icon: h(IconTrashFilled, { size: 16 }),
      onClick: () => deleteSection()
    },
    {
      label: t('newSection.add'),
      icon: h(IconPlusFilled, { size: 16 }),
      onClick: () => addSection()
    }
  )

  ContextMenu.showContextMenu({ x: e.x, y: e.y, theme, items })
}

const sectionWidth = computed(() => {
  if (props.section.style.fullWidth) return ''
  const mw = props.section.style.maxWidth ?? st.site?.options.desktopWidth
  return `max-width: ${mw}px;`
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
  <div
    class="section-row-wrapper"
    :style="[rowBackgroundStyle.style, sectionMargin, rowBackgroundStyle.clip ? 'overflow:hidden' : '']"
    @contextmenu="onContextMenu"
  >
    <div v-if="rowBackgroundStyle.overlay" class="section-bg-overlay" :style="rowBackgroundStyle.overlay" />
    <div
      ref="sectionRef"
      class="section"
      :class="{
        'section--hovered': hovered,
        'section--show-grid': shouldShow,
        'section--show-blocks': shouldShowBlocks
      }"
      :style="[
        gridStyle,
        sectionWidth,
        sectionFontVars,
        backgroundStyle.style,
        sectionPadding,
        backgroundStyle.clip ? 'overflow:hidden' : ''
      ]"
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
