<script setup lang="ts">
import { IconDeviceFloppy, IconAlertCircle } from '@tabler/icons-vue'

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
  const locs: any[] = st.site?.locales || []
  return locs.map((l: any) => (typeof l === 'string' ? l : l.code))
})

const defaultLocale = computed(() => {
  const locs: any[] = st.site?.locales || []
  const def = locs.find((l: any) => typeof l !== 'string' && l.is_default)
  return def ? (def as any).code : locs[0] || ''
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
  } catch (e: any) {
    err.addError(e?.data || { error: 'Error saving page', code: 500 })
  } finally {
    saving.value = false
  }
}
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
  </COffcanvasBody>
</template>
