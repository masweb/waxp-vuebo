<script lang="ts" setup>
import { IconCirclePlusFilled, IconPlus, IconClipboard } from '@tabler/icons-vue'

const props = defineProps<{
  section?: Section
}>()

const pg = pageStore()
const st = siteStore()
const hs = historyStore()
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

const addSection = async () => {
  if (!pg.page) return
  hs.snapshot()
  const resp = await useApi(`/api/sites/${st.site?.id}/sections/next-id`, { method: 'POST' })
  const newSection = createSection(resp.id)
  const insertAt = props.section
    ? pg.page.layout.findIndex(s => s.id === props.section!.id) + 1
    : 0
  pg.page.layout.splice(insertAt, 0, newSection)
  pg.openNewSectionId = null
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  if (pg.openNewSectionId === id) pg.openNewSectionId = null
})
</script>

<template>
  <div class="newsection-line" :class="{ 'newsection-line--open': isOpen }">
    <button class="btn btn-sm plus-new-section btn-link" @click="toggle">
      <IconCirclePlusFilled />
    </button>
    <Transition name="collapse">
      <div v-if="isOpen" class="newsection-collapse mb-2 mt-1">
        <button class="btn btn-sm btn-outline-primary" @click="addSection">
          <IconPlus :size="18" />
          {{ t('newSection.add') }}
        </button>
        <button class="btn btn-sm btn-outline-primary">
          <IconClipboard :size="18" />
          {{ t('newSection.paste') }}
        </button>
      </div>
    </Transition>
  </div>
</template>
