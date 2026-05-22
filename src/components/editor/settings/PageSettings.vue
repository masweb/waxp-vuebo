<script setup lang="ts">
import {
  IconDeviceFloppy,
  IconAlertCircle,
  IconArrowBigRightFilled,
  IconArrowBigLeftFilled,
  IconHistory
} from '@tabler/icons-vue'

import type { LocaleEntry } from '@/types/site'

const stt = settingsStore()
const pg = pageStore()
const st = siteStore()
const { showsettings } = storeToRefs(stt)
const { page } = storeToRefs(pg)
const hs = historyStore()
const err = errorsStore()
const { t } = useI18n()

const activeTab = ref('')
const saving = ref(false)
const attemptedSubmit = ref(false)
const fieldErrors = ref<Record<string, string>>({})

const localeCodes = computed(() => {
  const locs: LocaleEntry[] = st.site?.locales || []
  return locs.map(l => l.code)
})

const defaultLocale = computed(() => {
  const locs: LocaleEntry[] = st.site?.locales || []
  const def = locs.find(l => l.is_default)
  return def ? def.code : locs[0]?.code || ''
})

watch(
  defaultLocale,
  (val) => {
    if (val && !activeTab.value) activeTab.value = val
  },
  { immediate: true }
)

const isPublished = computed({
  get: () => !!page.value?.published_at,
  set: (v: boolean) => {
    if (!page.value) return
    hs.snapshot()
    page.value.published_at = v ? new Date().toISOString() : null
  }
})

const isRoot = computed(() =>
  page.value?.parent_id === null && page.value.slugs.some(s => s.slug === '')
)

const getSlug = (loc: string) => page.value?.slugs.find(s => s.locale_code === loc)?.slug ?? ''
const setSlug = (loc: string, val: string) => {
  if (!page.value) return
  hs.snapshot()
  const existing = page.value.slugs.find(s => s.locale_code === loc)
  if (existing) existing.slug = val
}

const getSeoTitle = (loc: string) => page.value?.seo.find(s => s.locale_code === loc)?.title ?? ''
const setSeoTitle = (loc: string, val: string) => {
  if (!page.value) return
  hs.snapshot()
  const existing = page.value.seo.find(s => s.locale_code === loc)
  if (existing) existing.title = val
}

const getSeoDescription = (loc: string) => page.value?.seo.find(s => s.locale_code === loc)?.description ?? ''
const setSeoDescription = (loc: string, val: string) => {
  if (!page.value) return
  hs.snapshot()
  const existing = page.value.seo.find(s => s.locale_code === loc)
  if (existing) existing.description = val
}

const clearFieldError = (key: string) => {
  delete fieldErrors.value[key]
}

const required = (val: string): true | string => {
  if (!val || !val.trim()) return t('validation.required')
  return true
}

const tabHasError = (loc: string) => {
  if (!attemptedSubmit.value) return false
  return !!fieldErrors.value[`${loc}_slug`] || !!fieldErrors.value[`${loc}_seoTitle`]
}

const validateAll = (): boolean => {
  fieldErrors.value = {}
  let valid = true

  for (const loc of localeCodes.value) {
    if (!isRoot.value) {
      const slugVal = getSlug(loc)
      const slugResult = required(slugVal)
      if (slugResult !== true) {
        fieldErrors.value[`${loc}_slug`] = slugResult
        valid = false
      }
    }
    const titleResult = required(getSeoTitle(loc))
    if (titleResult !== true) {
      fieldErrors.value[`${loc}_seoTitle`] = titleResult
      valid = false
    }
  }

  return valid
}

const handleSave = async () => {
  attemptedSubmit.value = true

  if (!validateAll()) {
    const firstErrorTab = localeCodes.value.find(loc => tabHasError(loc))
    if (firstErrorTab) activeTab.value = firstErrorTab
    return
  }

  if (!page.value) return
  saving.value = true

  try {
    const slugs = page.value.slugs.map(s => ({ locale_code: s.locale_code, slug: s.slug }))
    const seo = page.value.seo.map(s => ({ locale_code: s.locale_code, title: s.title, description: s.description }))
    const data: UpdatePageRequest = {
      published_at: page.value.published_at,
      slugs,
      seo
    }
    const resp = await useApi(`/api/sites/${st.site?.id}/pages/${page.value.id}?locale=${pg.currentLocale}`, {
      method: 'PUT',
      body: data
    })
    if (resp.id) {
      page.value = resp
      hs.clear(resp.id)
      await st.reloadRoutes()
    }
  } catch (e: unknown) {
    const data = typeof e === 'object' && e !== null && 'data' in e ? (e as { data: ApiError }).data : null
    err.addError(data || { error: 'Error saving page', code: 500 })
  } finally {
    saving.value = false
  }
}

const allRevisions = ref<{ id: number; revision_number: number; created_at: string }[]>([])
const revPerPage = 10
const revCurrentPage = ref(1)
const revLoading = ref(false)
const restoringId = ref<number | null>(null)

const revTotal = computed(() => allRevisions.value.length)
const revTotalPages = computed(() => Math.ceil(revTotal.value / revPerPage))
const revisions = computed(() => {
  const start = (revCurrentPage.value - 1) * revPerPage
  return allRevisions.value.slice(start, start + revPerPage)
})

const fetchRevisions = async () => {
  if (!page.value || !st.site) return
  revLoading.value = true
  try {
    const resp = await useApi(`/api/sites/${st.site.id}/pages/${page.value.id}/revisions`)
    allRevisions.value = (resp.data ?? []).reverse()
    revCurrentPage.value = 1
  } catch {
    allRevisions.value = []
  } finally {
    revLoading.value = false
  }
}

const revNextPage = () => {
  if (revCurrentPage.value < revTotalPages.value) revCurrentPage.value++
}

const revPrevPage = () => {
  if (revCurrentPage.value > 1) revCurrentPage.value--
}

const formatRevDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const restoreRevision = async (revisionId: number) => {
  if (!page.value || !st.site) return
  restoringId.value = revisionId
  try {
    const resp: Page = await useApi(
      `/api/sites/${st.site.id}/pages/${page.value.id}/revisions/${revisionId}/restore?locale=${pg.currentLocale}`,
      { method: 'POST' }
    )
    if (resp.id) {
      page.value = resp
      hs.clear(resp.id)
      await fetchRevisions()
    }
  } catch (e: unknown) {
    const data = typeof e === 'object' && e !== null && 'data' in e ? (e as { data: ApiError }).data : null
    err.addError(data || { error: 'Error restoring revision', code: 500 })
  } finally {
    restoringId.value = null
  }
}

watch(page, (val) => {
  if (val?.id) fetchRevisions()
}, { immediate: true })
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>{{ t('pages.pageOptions') }}</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody v-if="page">
    <div class="mb-3">
      <div class="d-flex align-items-center justify-content-between">
        <label class="small mb-0">{{ isPublished ? t('pages.published') : t('pages.draft') }}</label>
        <CFormSwitch :checked="isPublished" @change="isPublished = !isPublished" />
      </div>
    </div>

    <ul class="nav nav-tabs mb-2" style="font-size: 0.75rem">
      <li v-for="loc in localeCodes" :key="loc" class="nav-item">
        <button
          class="nav-link py-1 px-2 d-flex align-items-center gap-1"
          :class="{ active: activeTab === loc }"
          @click="activeTab = loc"
        >
          {{ loc.toUpperCase() }}
          <IconAlertCircle v-if="tabHasError(loc)" :size="12" class="text-danger" />
        </button>
      </li>
    </ul>

    <template v-for="loc in localeCodes" :key="loc">
      <div v-show="activeTab === loc" class="mb-2">
        <div class="mb-2">
          <label class="form-label mb-1" style="font-size: 0.75rem">{{ t('slug') }}</label>
          <input
            :value="getSlug(loc)"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': fieldErrors[`${loc}_slug`] }"
            :disabled="isRoot"
            @input="setSlug(loc, ($event.target as HTMLInputElement).value); clearFieldError(`${loc}_slug`)"
          />
          <div v-if="fieldErrors[`${loc}_slug`]" class="invalid-feedback" style="font-size: 0.7rem">
            {{ fieldErrors[`${loc}_slug`] }}
          </div>
        </div>
        <div class="mb-2">
          <label class="form-label mb-1" style="font-size: 0.75rem">{{ t('pages.seo') }} - {{ t('title') }}</label>
          <input
            :value="getSeoTitle(loc)"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': fieldErrors[`${loc}_seoTitle`] }"
            @input="setSeoTitle(loc, ($event.target as HTMLInputElement).value); clearFieldError(`${loc}_seoTitle`)"
          />
          <div v-if="fieldErrors[`${loc}_seoTitle`]" class="invalid-feedback" style="font-size: 0.7rem">
            {{ fieldErrors[`${loc}_seoTitle`] }}
          </div>
        </div>
        <div>
          <label class="form-label mb-1" style="font-size: 0.75rem">{{ t('pages.seo') }} - {{ t('pages.description') }}</label>
          <textarea
            :value="getSeoDescription(loc)"
            class="form-control form-control-sm"
            rows="2"
            @input="setSeoDescription(loc, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </template>

    <div class="d-flex gap-2 mt-2">
      <button class="btn btn-sm btn-primary" :disabled="saving" @click="handleSave">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1" />
        <IconDeviceFloppy v-else :size="14" class="me-1" />
        {{ t('common.save') }}
      </button>
    </div>

    <hr class="my-3" />

    <div>
      <div class="d-flex align-items-center gap-1 mb-2">
        <IconHistory :size="14" />
        <small class="fw-semibold text-secondary">{{ t('pages.revisions') }}</small>
      </div>

      <div v-if="revLoading && !revisions.length" class="text-center py-2">
        <span class="spinner-border spinner-border-sm text-secondary" />
      </div>

      <div v-else-if="revisions.length">
        <div
          v-for="rev in revisions"
          :key="rev.id"
          class="d-flex align-items-center justify-content-between py-1 border-bottom"
        >
          <div>
            <small class="fw-semibold text-secondary">#{{ rev.revision_number }}</small>
            <small class="text-muted ms-2">{{ formatRevDate(rev.created_at) }}</small>
          </div>
          <button
            class="btn btn-sm btn-link p-0 text-secondary"
            :disabled="restoringId === rev.id"
            @click="restoreRevision(rev.id)"
          >
            <span v-if="restoringId === rev.id" class="spinner-border spinner-border-sm" />
            <small v-else>{{ t('pages.restore') }}</small>
          </button>
        </div>

        <nav v-if="revTotal" class="d-flex justify-content-between align-items-center mt-2">
          <small class="text-muted">
            {{ t('common.pageOf', { page: revCurrentPage, total: revTotalPages }) }} · {{ revTotal }}
          </small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary btn-sm p-0 px-1" :disabled="revCurrentPage <= 1" @click="revPrevPage">
              <IconArrowBigLeftFilled :size="16" />
            </button>
            <button class="btn btn-outline-secondary btn-sm p-0 px-1" :disabled="revCurrentPage >= revTotalPages" @click="revNextPage">
              <IconArrowBigRightFilled :size="16" />
            </button>
          </div>
        </nav>
      </div>

      <div v-else class="text-center text-muted py-2">
        <small>{{ t('common.noResults') }}</small>
      </div>
    </div>
  </COffcanvasBody>
</template>
