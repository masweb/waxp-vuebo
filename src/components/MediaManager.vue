<script lang="ts" setup>
import {
  IconUpload,
  IconTrashFilled,
  IconPhoto,
  IconX,
  IconLoader2,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-vue'

const { t } = useI18n()
const apiBase = import.meta.env.VITE_END_POINT
const PAGE_SIZE = 12

interface MediaItem {
  id: number
  filename: string
  mime_type: string
  size: number
  url: string
  thumbnail_url: string | null
  created_at: string
}

const allItems = ref<MediaItem[]>([])
const loading = ref(false)
const uploading = ref(false)
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const deleteTarget = ref<MediaItem | null>(null)
const deleting = ref(false)
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(allItems.value.length / PAGE_SIZE))
const pageItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return allItems.value.slice(start, start + PAGE_SIZE)
})

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

const uploadFiles = async (files: FileList | File[]) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const validFiles = Array.from(files).filter(f => validTypes.includes(f.type))
  if (!validFiles.length) return

  uploading.value = true
  for (const file of validFiles) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const media = await useApi('/api/media', {
        method: 'POST',
        body: formData
      })
      allItems.value.unshift(media)
      currentPage.value = 1
    } catch (error: any) {
      const apiError = error?.data as ApiError
      if (apiError) errorsStore().addError(apiError)
    }
  }
  uploading.value = false
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) uploadFiles(input.files)
  input.value = ''
}

const onDrop = (event: DragEvent) => {
  dragOver.value = false
  if (event.dataTransfer?.files.length) uploadFiles(event.dataTransfer.files)
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = true
}

const onDragLeave = () => {
  dragOver.value = false
}

const confirmDelete = (item: MediaItem) => {
  deleteTarget.value = item
}

const deleteMedia = async () => {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = true
  try {
    await useApi(`/api/media/${deleteTarget.value.id}`, { method: 'DELETE' })
    allItems.value = allItems.value.filter(i => i.id !== deleteTarget.value!.id)
    deleteTarget.value = null
  } catch {
  } finally {
    deleting.value = false
  }
}

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

const imgUrl = (url: string) => `${apiBase}${url}`

onMounted(() => fetchMedia())
</script>

<template>
  <div>
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0 ms-2">{{ t('media.title') }}</h5>
        <div v-if="allItems.length" class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" :disabled="currentPage <= 1 || loading" @click="prevPage">
            <IconChevronLeft :size="16" />
          </button>
          <button class="btn btn-outline-secondary" :disabled="currentPage >= totalPages || loading" @click="nextPage">
            <IconChevronRight :size="16" />
          </button>
        </div>
        <input ref="fileInput" type="file" accept="image/*" multiple class="d-none" @change="onFileChange" />
      </div>
      <div class="card-body pt-1">
        <div v-if="loading && !allItems.length" class="text-center py-4">
          <span class="spinner-border spinner-border-sm me-2" role="status" />
          {{ t('loading') }}
        </div>

        <div v-if="pageItems.length" class="gallery-grid">
          <div v-for="item in pageItems" :key="item.id" class="gallery-item">
            <div class="gallery-thumb">
              <img
                :src="imgUrl(item.thumbnail_url || item.url)"
                :alt="item.filename"
                :title="`${item.filename} · ${formatSize(item.size)}`"
                loading="lazy"
              />
              <div class="gallery-overlay">
                <button class="btn btn-sm btn-danger gallery-delete" @click.stop="confirmDelete(item)">
                  <IconTrashFilled :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && !allItems.length" class="text-center text-muted py-4">
          {{ t('common.noResults') }}
        </div>

        <div
          class="gallery-dropzone mt-2"
          :class="{ 'gallery-dropzone-active': dragOver, 'gallery-dropzone-uploading': uploading }"
          @drop.prevent="onDrop"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @click="fileInput?.click()"
        >
          <span class="text-muted">{{ uploading ? t('media.uploading') : t('media.dropzone') }}</span>
        </div>
      </div>

      <div v-if="allItems.length" class="card-footer d-flex justify-content-between align-items-center">
        <small class="text-muted">
          {{ t('common.pageOf', { page: currentPage, total: totalPages }) }} · {{ allItems.length }}
          {{ t('media.items') }}
        </small>
      </div>
    </div>

    <div v-if="deleteTarget" class="modal-backdrop show" />
    <div v-if="deleteTarget" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('common.deleteTitle') }}</h5>
            <button type="button" class="btn-close" @click="deleteTarget = null" />
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ t('common.deleteConfirm', { name: deleteTarget.filename }) }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="deleteTarget = null">
              {{ t('common.cancel') }}
            </button>
            <button class="btn btn-danger btn-sm" :disabled="deleting" @click="deleteMedia">
              {{ deleting ? '...' : t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
