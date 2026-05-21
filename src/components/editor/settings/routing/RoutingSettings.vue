<script setup lang="ts">
import { IconPlus, IconAlertTriangle } from '@tabler/icons-vue'
import type { LocaleEntry } from '@/types/site'

const stt = settingsStore()
const { showsettings } = storeToRefs(stt)
const st = siteStore()
const err = errorsStore()
const { fetchPages, createPage, updatePage, deletePage } = usePagesApi()
const { t } = useI18n()

const pages = ref<Page[]>([])
const loading = ref(false)
const formState = ref<{ mode: 'edit' | 'create'; page?: Page; parentId?: number | null } | null>(null)
const confirmDelete = ref<Page | null>(null)
const activeLocale = ref('')

const localeCodes = computed(() => {
  const locs: LocaleEntry[] = st.site?.locales || []
  return locs.map(l => l.code)
})

const defaultLocale = computed(() => {
  const locs: LocaleEntry[] = st.site?.locales || []
  const def = locs.find(l => l.is_default)
  return def ? def.code : locs[0]?.code || ''
})

watch(defaultLocale, (val) => {
  if (val && !activeLocale.value) activeLocale.value = val
}, { immediate: true })

const routesByLocale = computed(() => st.site?.routes || {} as Record<string, { path: string; page_id: number }[]>)

const buildTree = (flatPages: Page[]): Page[] => {
  const map = new Map<number, Page>()
  const roots: Page[] = []

  for (const p of flatPages) {
    map.set(p.id, { ...p, children: [] })
  }

  for (const p of map.values()) {
    if (p.parent_id && map.has(p.parent_id)) {
      map.get(p.parent_id)!.children!.push(p)
    } else {
      roots.push(p)
    }
  }

  return roots
}

const tree = computed(() => buildTree(pages.value))

const routeCountForLocale = (loc: string) => (routesByLocale.value[loc] || []).length

const loadPages = async () => {
  loading.value = true
  try {
    pages.value = await fetchPages()
  } catch (e: any) {
    err.addError(e?.data || { error: 'Error loading pages', code: 500 })
  } finally {
    loading.value = false
  }
}

const handleSave = async (data: CreatePageRequest | UpdatePageRequest, pageId?: number) => {
  try {
    const locale = defaultLocale.value || 'es'
    if (pageId) {
      await updatePage(pageId, data as UpdatePageRequest, locale)
    } else {
      await createPage(data as CreatePageRequest, locale)
    }
    formState.value = null
    await st.reloadRoutes()
    await loadPages()
  } catch (e: any) {
    err.addError(e?.data || { error: 'Error saving page', code: 500 })
  }
}

const isRootPage = (page: Page) => page.parent_id === null && page.slugs.some(s => s.slug === '')

const handleEdit = (page: Page) => {
  formState.value = { mode: 'edit', page }
}

const handleAddChild = (parentId: number) => {
  formState.value = { mode: 'create', parentId }
}

const handleAddRoot = () => {
  formState.value = { mode: 'create', parentId: null }
}

const handleDelete = (page: Page) => {
  confirmDelete.value = page
}

const confirmDeletePage = async () => {
  if (!confirmDelete.value) return
  try {
    await deletePage(confirmDelete.value.id)
    confirmDelete.value = null
    await st.reloadRoutes()
    await loadPages()
  } catch (e: any) {
    err.addError(e?.data || { error: 'Error deleting page', code: 500 })
  }
}

onMounted(loadPages)
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>{{ t('pages.routes') }}</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-secondary" />
    </div>

    <template v-else>
      <div v-if="formState" class="mb-3">
        <PageForm
          :page="formState.mode === 'edit' ? formState.page : undefined"
          :parent-id="formState.parentId"
          :locales="localeCodes"
          :is-root="formState.mode === 'edit' && formState.page ? isRootPage(formState.page) : false"
          :existing-pages="pages"
          @save="handleSave"
          @cancel="formState = null"
        />
      </div>

      <div v-if="confirmDelete" class="border rounded p-2 mb-3 bg-danger bg-opacity-10">
        <div class="d-flex align-items-start gap-2">
          <IconAlertTriangle :size="18" class="text-danger mt-1 flex-shrink-0" />
          <div class="flex-grow-1">
            <small>{{
              t('common.deleteConfirm', { name: confirmDelete.seo?.[0]?.title || `#${confirmDelete.id}` })
            }}</small>
            <div class="d-flex gap-2 mt-2">
              <button class="btn btn-sm btn-danger" @click="confirmDeletePage">
                {{ t('common.delete') }}
              </button>
              <button class="btn btn-sm btn-outline-secondary" @click="confirmDelete = null">
                {{ t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ul v-if="localeCodes.length > 1" class="nav nav-tabs mb-2" style="font-size: 0.75rem">
        <li v-for="loc in localeCodes" :key="loc" class="nav-item">
          <button
            class="nav-link py-1 px-2"
            :class="{ active: activeLocale === loc }"
            @click="activeLocale = loc"
          >
            {{ loc.toUpperCase() }}
            <span class="text-secondary ms-1" style="font-size: 0.65rem">({{ routeCountForLocale(loc) }})</span>
          </button>
        </li>
      </ul>

      <div class="d-flex justify-content-between align-items-center mb-2">
        <small class="text-secondary fw-semibold">{{ pages.length }} {{ t('pages.routes').toLowerCase() }}</small>
        <button class="btn btn-sm btn-outline-primary" @click="handleAddRoot">
          <IconPlus :size="14" class="me-1" />
          {{ t('pages.addRoot') }}
        </button>
      </div>

      <div v-if="tree.length" class="border rounded p-1">
        <PageTreeNode
          v-for="page in tree"
          :key="page.id"
          :page="page"
          :active-locale="activeLocale"
          :default-locale="defaultLocale"
          @edit="handleEdit"
          @add-child="handleAddChild"
          @delete="handleDelete"
        />
      </div>
      <div v-else class="text-center text-muted py-4">
        <small>{{ t('common.noResults') }}</small>
      </div>
    </template>
  </COffcanvasBody>
</template>
