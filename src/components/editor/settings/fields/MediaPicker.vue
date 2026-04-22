<script lang="ts" setup>
import { IconPhoto, IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'

const props = defineProps<{
  url?: string
}>()

const emit = defineEmits<{
  (e: 'select', url: string): void
  (e: 'clear'): void
}>()

const { t } = useI18n()
const apiBase = import.meta.env.VITE_END_POINT

interface MediaItem {
  id: number
  filename: string
  url: string
  thumbnail_url: string | null
  size: number
  mime_type: string
}

const allItems = ref<MediaItem[]>([])
const loading = ref(false)
const open = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 12
const totalPages = computed(() => Math.ceil(allItems.value.length / PAGE_SIZE))
const pageItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return allItems.value.slice(start, start + PAGE_SIZE)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fetchMedia = async () => {
  loading.value = true
  try {
    const res = await useApi('/api/media')
    allItems.value = res.data ?? []
  } catch {
    allItems.value = []
  } finally {
    loading.value = false
  }
}

const toggle = () => {
  open.value = !open.value
  if (open.value && !allItems.value.length) fetchMedia()
}

const pick = (item: MediaItem) => {
  emit('select', item.url)
  open.value = false
}

const clear = () => {
  emit('clear')
}

const imgUrl = (url: string) => `${apiBase}${url}`

const onClickOutside = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.media-picker')) open.value = false
}

watch(open, val => {
  if (val) document.addEventListener('click', onClickOutside)
  else document.removeEventListener('click', onClickOutside)
})

onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div class="media-picker position-relative">
    <div v-if="url" class="d-flex align-items-center gap-2 mb-1">
      <img :src="`${apiBase}${url}`" class="rounded" style="width: 40px; height: 40px; object-fit: cover" />
      <button class="btn btn-sm btn-outline-secondary" @click="toggle">
        <IconPhoto :size="14" />
      </button>
      <button class="btn btn-sm btn-outline-danger" @click="clear">
        <IconX :size="14" />
      </button>
    </div>
    <button v-else class="btn btn-sm btn-outline-secondary d-flex align-items-center" @click="toggle">
      <slot name="icon">
        <IconPhoto :size="14" />
      </slot>
    </button>
    <div v-if="open" class="media-picker-dropdown">
      <div v-if="loading && !allItems.length" class="text-center py-3">
        <span class="spinner-border spinner-border-sm" />
      </div>
      <div v-else-if="!allItems.length" class="text-center text-muted py-3 small">
        {{ t('common.noResults') }}
      </div>
      <template v-else>
        <div class="gallery-grid">
          <div
            v-for="item in pageItems"
            :key="item.id"
            class="gallery-item"
            :class="{ active: item.url === props.url }"
            @click="pick(item)"
          >
            <div class="gallery-thumb">
              <img
                :src="imgUrl(item.thumbnail_url || item.url)"
                :alt="item.filename"
                :title="`${item.filename} · ${formatSize(item.size)}`"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-2 px-1">
          <button
            class="btn btn-sm btn-outline-secondary py-0 px-1"
            :disabled="currentPage <= 1"
            @click="prevPage"
          >
            <IconChevronLeft :size="14" />
          </button>
          <small class="text-muted">{{ currentPage }}/{{ totalPages }}</small>
          <button
            class="btn btn-sm btn-outline-secondary py-0 px-1"
            :disabled="currentPage >= totalPages"
            @click="nextPage"
          >
            <IconChevronRight :size="14" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
