<script lang="ts" setup>
import { IconCirclePlusFilled, IconPlus, IconClipboard } from '@tabler/icons-vue'

const pg = pageStore()
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
      <div v-if="isOpen" class="newsection-collapse">
        <button class="btn btn-sm btn-link">
          <IconPlus :size="18" />
          {{ t('newSection.add') }}
        </button>
        <button class="btn btn-sm btn-link">
          <IconClipboard :size="18" />
          {{ t('newSection.paste') }}
        </button>
      </div>
    </Transition>
  </div>
</template>
