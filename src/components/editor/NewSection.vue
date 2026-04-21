<script lang="ts" setup>
import {
  IconCirclePlusFilled,
  IconPlusFilled,
  IconClipboardFilled,
  IconCopyFilled,
  IconArrowBigDownFilled,
  IconArrowBigUpFilled,
  IconSettingsFilled,
  IconTrashFilled
} from '@tabler/icons-vue'

const props = defineProps<{
  section?: Section
}>()

const pg = pageStore()
const st = siteStore()
const hs = historyStore()
const stt = settingsStore()
const { deactivate } = useTipTap()
const id = getCurrentInstance()!.uid
const { t } = useI18n()

const isOpen = computed(() => pg.openNewSectionId === id)

const toggle = (e: MouseEvent) => {
  e.stopPropagation()
  pg.openNewSectionId = isOpen.value ? null : id
}

const closeOnOutsideClick = (e: MouseEvent) => {
  if (!isOpen.value) return
  if (!(e.target as HTMLElement).closest('.newsection-line')) {
    pg.openNewSectionId = null
  }
}

const hasClipboard = computed(() => pg.clipboardSection !== null)

const collapseBg = computed(() => {
  const opts = st.site?.options
  if (!opts) return ''
  return opts.darkMode ? opts.darkBackColor : opts.lightBackColor
})

const sectionIndex = computed(() => {
  if (!props.section || !pg.page) return -1
  return pg.page.layout.findIndex(s => s.id === props.section!.id)
})

const isFirst = computed(() => sectionIndex.value === 0)
const isLast = computed(() => (pg.page ? sectionIndex.value === pg.page.layout.length - 1 : false))

const copySection = () => {
  if (!props.section) return
  pg.clipboardSection = JSON.parse(JSON.stringify(props.section))
  pg.openNewSectionId = null
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

const sectionSettings = () => {
  if (!props.section) return
  pg.setActiveSection(props.section.id)
  stt.setSetting('SectionSettings')
  pg.openNewSectionId = null
}

const deleteSection = () => {
  if (!props.section || !pg.page) return
  const hasActiveBlock = pg.activeBlock && props.section.blocks.some(b => b.id === pg.activeBlock!.id)
  if (hasActiveBlock) deactivate()
  hs.snapshot()
  const idx = pg.page.layout.findIndex(s => s.id === props.section!.id)
  if (idx !== -1) pg.page.layout.splice(idx, 1)
  pg.setActiveBlock(null)
  if (pg.activeSection?.id === props.section!.id) pg.activeSection = null
  pg.openNewSectionId = null
}

const addSection = async () => {
  if (!pg.page) return
  hs.snapshot()
  const resp = await useApi(`/api/sites/${st.site?.id}/sections/next-id`, { method: 'POST' })
  const newSection = createSection(resp.id)
  const insertAt = props.section ? pg.page.layout.findIndex(s => s.id === props.section!.id) + 1 : 0
  pg.page.layout.splice(insertAt, 0, newSection)
  pg.openNewSectionId = null
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
  const insertAt = props.section ? pg.page.layout.findIndex(s => s.id === props.section!.id) + 1 : 0
  pg.page.layout.splice(insertAt, 0, pasted)
  pg.openNewSectionId = null
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  if (pg.openNewSectionId === id) pg.openNewSectionId = null
})
</script>

<template>
  <div class="newsection-line" :class="{ 'newsection-line--open': isOpen }" :style="{ backgroundColor: collapseBg }">
    <button class="btn btn-sm plus-new-section btn-link" @click="toggle">
      <IconCirclePlusFilled />
    </button>
    <Transition name="collapse">
      <div v-if="isOpen" class="newsection-collapse mb-2 mt-1">
        <button v-if="section" class="btn btn-sm btn-outline-primary" @click="sectionSettings">
          <IconSettingsFilled :size="22" />
          {{ t('newSection.settings') }}
        </button>

        <button v-if="section" class="btn btn-sm btn-outline-primary" @click="copySection">
          <IconCopyFilled :size="22" />
          {{ t('newSection.copy') }}
        </button>
        <button v-if="hasClipboard" class="btn btn-sm btn-outline-primary" @click="pasteSection">
          <IconClipboardFilled :size="22" />
          {{ t('newSection.paste') }}
        </button>
        <button v-if="section && !isFirst" class="btn btn-sm btn-outline-primary" @click="moveUp">
          <IconArrowBigUpFilled :size="22" />
          {{ t('newSection.moveUp') }}
        </button>
        <button v-if="section && !isLast" class="btn btn-sm btn-outline-primary" @click="moveDown">
          <IconArrowBigDownFilled :size="22" />
          {{ t('newSection.moveDown') }}
        </button>

        <button v-if="section" class="btn btn-sm btn-outline-danger" @click="deleteSection">
          <IconTrashFilled :size="22" />
          {{ t('newSection.delete') }}
        </button>
        <button class="btn btn-sm btn-outline-primary" @click="addSection">
          <IconPlusFilled :size="22" />
          {{ t('newSection.add') }}
        </button>
      </div>
    </Transition>
  </div>
</template>
