<script lang="ts" setup>
import { IconPlus, IconTrash, IconEditFilled, IconTrashFilled, IconArrowBigRightFilled, IconArrowBigLeftFilled } from '@tabler/icons-vue'
import { siteOptions } from '@/types/defaultOptions'
import type { Site } from '@/types/site'

interface SiteRow extends Site {
  is_live: boolean
  created_at: string
  updated_at: string
}

const { t } = useI18n()
const { languages } = useReferenceData()
const st = siteStore()
const { isDemo } = useDemoMode()

const LIMIT = 10

const data = ref<SiteRow[]>([])
const loading = ref(false)
const nextCursor = ref<number | null>(null)
const hasMore = ref(false)
const total = ref(0)
const isFirstPage = ref(true)
const currentPage = ref(1)
const showCreateModal = ref(false)
const editTarget = ref<SiteRow | null>(null)
const firstInput = ref<HTMLInputElement[]>([])
const formLoading = ref(false)
const deletingIds = ref<Set<number>>(new Set())
const deleteTarget = ref<SiteRow | null>(null)
const filterValues = ref<Record<string, string>>({ name: '', domain: '' })
const togglingId = ref<number | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const activeFilterCount = computed(() => Object.values(filterValues.value).filter(v => v.trim()).length)
const totalPages = computed(() => Math.ceil(total.value / LIMIT))
const isModalOpen = computed(() => showCreateModal.value || !!editTarget.value)

const sortLanguages = computed(() => [...languages.value].sort((a, b) => a.name.es.localeCompare(b.name.es)))

const { errors, setFieldError, setFieldValue, resetForm, values } = useForm<{
  name: string
  domain: string
  locales: LocaleEntry[]
  options: siteOptions
}>({
  validateOnMount: false
})

interface LocaleEntry {
  code: string
  is_default: boolean
}

const onFilterInput = (key: string, value: string) => {
  filterValues.value[key] = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 500)
}

const clearFilters = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  filterValues.value = { name: '', domain: '' }
  currentPage.value = 1
  fetchData()
}

const buildUrl = (cursor?: number) => {
  const params = new URLSearchParams()
  params.set('limit', String(LIMIT))
  if (cursor) params.set('cursor', String(cursor))
  const nameVal = filterValues.value.name?.trim()
  if (nameVal) params.set('filter[name_like]', nameVal)
  const domainVal = filterValues.value.domain?.trim()
  if (domainVal) params.set('filter[domain_like]', domainVal)
  return `/api/sites?${params.toString()}`
}

const fetchData = async (cursor?: number) => {
  loading.value = true
  try {
    const res = await useApi(buildUrl(cursor))
    const items = res.data ?? res
    data.value = [...items].reverse()
    nextCursor.value = res.next_cursor ?? null
    hasMore.value = res.has_more ?? false
    total.value = res.total ?? 0
    isFirstPage.value = !cursor
  } catch {
    data.value = []
    nextCursor.value = null
    hasMore.value = false
    total.value = 0
  } finally {
    loading.value = false
  }
}

const nextPage = () => {
  if (nextCursor.value) {
    currentPage.value++
    fetchData(nextCursor.value)
  }
}

const prevPage = () => {
  if (!isFirstPage.value) {
    currentPage.value--
    fetchData()
  }
}

const validateForm = (): boolean => {
  let valid = true
  if (!values.name?.trim()) {
    setFieldError('name', t('validation.required'))
    valid = false
  }
  if (!values.domain?.trim()) {
    setFieldError('domain', t('validation.required'))
    valid = false
  }
  return valid
}

const openCreateModal = () => {
  resetForm({ values: { name: '', domain: '', locales: [], options: { ...siteOptions } } })
  editTarget.value = null
  showCreateModal.value = true
  setTimeout(() => firstInput.value[0]?.focus())
}

const openEditModal = (row: SiteRow) => {
  const { id: _, created_at: __, updated_at: ___, ...formValues } = row
  if (formValues.name == null) formValues.name = ''
  if (formValues.domain == null) formValues.domain = ''
  resetForm({ values: formValues })
  editTarget.value = row
  showCreateModal.value = false
  setTimeout(() => firstInput.value[0]?.focus())
}

const closeModal = () => {
  showCreateModal.value = false
  editTarget.value = null
}

const buildSiteQuery = (vals: typeof values) => {
  const defaultLoc = (vals.locales || []).find((l: LocaleEntry) => l.is_default)
  return defaultLoc ? `?locale=${defaultLoc.code}` : ''
}

const submitForm = async () => {
  if (!validateForm()) return
  formLoading.value = true
  const query = buildSiteQuery(values)
  try {
    if (editTarget.value) {
      await useApi(`/api/sites/${editTarget.value.id}${query}`, { method: 'PUT', body: { ...values } })
    } else {
      await useApi(`/api/sites${query}`, { method: 'POST', body: { ...values } })
    }
    closeModal()
    await fetchData()
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'data' in error) {
      const apiError = (error as { data: ApiError }).data
      errorsStore().addError(apiError)
    }
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (row: SiteRow) => {
  deleteTarget.value = row
}

const deleteItem = async () => {
  const row = deleteTarget.value
  if (!row || deletingIds.value.has(row.id)) return
  deletingIds.value.add(row.id)
  try {
    await useApi(`/api/sites/${row.id}`, { method: 'DELETE' })
    total.value--
    deleteTarget.value = null
    if (!data.value.length && !isFirstPage.value) prevPage()
    else data.value = data.value.filter(item => item.id !== row.id)
  } catch {
  } finally {
    deletingIds.value.delete(row.id)
  }
}

const toggleLive = async (row: SiteRow) => {
  if (row.is_live || togglingId.value !== null) return
  togglingId.value = row.id
  try {
    await useApi(`/api/sites/${row.id}/live`, { method: 'PUT' })
    for (const r of data.value) {
      r.is_live = r.id === row.id
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'data' in error) {
      const apiError = (error as { data: ApiError }).data
      errorsStore().addError(apiError)
    }
  } finally {
    togglingId.value = null
  }
}

const addLocale = () => {
  const current: LocaleEntry[] = values.locales ?? []
  setFieldValue('locales', [...current, { code: '', is_default: current.length === 0 }])
}

const removeLocale = (index: number) => {
  const current: LocaleEntry[] = values.locales ?? []
  const updated = current.filter((_: LocaleEntry, i: number) => i !== index)
  if (updated.length > 0 && !updated.some((l: LocaleEntry) => l.is_default)) {
    updated[0].is_default = true
  }
  setFieldValue('locales', updated)
}

const setDefaultLocale = (index: number) => {
  const current: LocaleEntry[] = values.locales ?? []
  setFieldValue(
    'locales',
    current.map((l: LocaleEntry, i: number) => ({ ...l, is_default: i === index }))
  )
}

const updateLocaleCode = (index: number, code: string) => {
  const current: LocaleEntry[] = values.locales ?? []
  setFieldValue(
    'locales',
    current.map((l: LocaleEntry, i: number) => (i === index ? { ...l, code } : l))
  )
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0 ms-2">{{ t('sites.sites') }}</h5>
        <button class="btn btn-outline-primary btn-sm" @click="openCreateModal">
          + {{ t('common.add') }} {{ t('sites.sites') }}
        </button>
      </div>
      <div class="card-body pt-1">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ t('name') }}</th>
              <th>{{ t('domain') }}</th>
              <th class="text-center">{{ t('sites.live') }}</th>
              <th class="text-center">{{ t('sites.languages') }}</th>
              <th v-if="activeFilterCount" class="text-end">
                <button class="btn btn-sm btn-link p-0 text-danger" @click="clearFilters">
                  {{ t('common.clearFilters') }}
                </button>
              </th>
              <th v-else class="text-end" />
            </tr>
            <tr>
              <th>
                <input
                  :value="filterValues.name"
                  class="form-control form-control-sm"
                  :placeholder="t('common.filter') + '...'"
                  :aria-label="t('name')"
                  @input="onFilterInput('name', ($event.target as HTMLInputElement).value)"
                />
              </th>
              <th>
                <input
                  :value="filterValues.domain"
                  class="form-control form-control-sm"
                  :placeholder="t('common.filter') + '...'"
                  :aria-label="t('domain')"
                  @input="onFilterInput('domain', ($event.target as HTMLInputElement).value)"
                />
              </th>
              <th />
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="5" class="text-center py-4">
                <span class="spinner-border spinner-border-sm me-2" role="status" />
                {{ t('loading') }}
              </td>
            </tr>
            <tr v-for="(row, idx) in data" :key="idx">
              <td>
                <div @click="st.openSite(row.id)" class="btn btn-link p-0 text-decoration-none">{{ row.name }}</div>
              </td>
              <td>{{ row.domain }}</td>
              <td class="text-center">
                <div class="form-check form-switch d-flex justify-content-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    :checked="row.is_live"
                    :disabled="togglingId !== null"
                    :aria-label="t('sites.live')"
                    @change.prevent="toggleLive(row)"
                  />
                </div>
              </td>
              <td class="text-center">
                <template v-if="row.locales.length > 0">
                  <span v-for="(locale, i) in row.locales" :key="locale.id ?? i" class="me-1">
                    <span class="badge bg-secondary">{{ locale.code }}</span>
                  </span>
                </template>
                <template v-else>-</template>
              </td>
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end">
                  <button class="btn btn-sm btn-link p-0" @click="openEditModal(row)" aria-label="Edit">
                    <IconEditFilled :size="22" stroke-width="1.2" />
                  </button>
                  <button
                    class="btn btn-sm btn-link p-0"
                    :disabled="deletingIds.has(row.id)"
                    @click="confirmDelete(row)"
                    aria-label="Delete"
                  >
                    <IconTrashFilled :size="22" stroke-width="1.2" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !data.length">
              <td colspan="5" class="text-center text-muted py-4">
                {{ t('common.noResults') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <nav v-if="total" class="d-flex justify-content-between align-items-center">
          <small class="text-muted">
            {{ t('common.pageOf', { page: currentPage, total: totalPages }) }} · {{ total }} {{ t('common.results') }}
          </small>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" :disabled="isFirstPage" @click="prevPage" aria-label="Previous page">
              <IconArrowBigLeftFilled />
            </button>
            <button
              class="btn btn-outline-secondary"
              :disabled="!hasMore || currentPage >= totalPages"
              @click="nextPage"
              aria-label="Next page"
            >
              <IconArrowBigRightFilled />
            </button>
          </div>
        </nav>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-backdrop show" />
    <div v-if="isModalOpen" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editTarget ? t('common.edit') : t('common.add') }} {{ t('sites.sites') }}</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label" for="site-name">
                {{ t('name') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="site-name"
                ref="firstInput"
                :value="values.name"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                @input="setFieldValue('name', ($event.target as HTMLInputElement).value)"
                @keyup.enter="submitForm"
              />
              <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="site-domain">
                {{ t('domain') }}
                <span class="text-danger">*</span>
              </label>
              <input
                id="site-domain"
                :value="values.domain"
                class="form-control"
                :class="{ 'is-invalid': errors.domain }"
                @input="setFieldValue('domain', ($event.target as HTMLInputElement).value)"
                @keyup.enter="submitForm"
              />
              <div v-if="errors.domain" class="invalid-feedback">{{ errors.domain }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ t('sites.languages') }}</label>
              <p class="form-text mb-2">{{ t('sites.select_lang') }}</p>
              <div v-for="(locale, index) in values.locales ?? []" :key="index" class="d-flex align-items-center gap-2 mb-2">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    :name="'default-locale-' + (editTarget?.id ?? 'new')"
                    :checked="locale.is_default"
                    @change="setDefaultLocale(index)"
                  />
                  <label class="form-check-label" :title="t('sites.default_lang')">
                    <small>{{ t('sites.default_lang') }}</small>
                  </label>
                </div>
                <select
                  class="form-select form-select-sm"
                  :value="locale.code"
                  :class="{ 'is-invalid': locale.code === '' }"
                  @change="updateLocaleCode(index, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="" disabled>{{ t('select') }}</option>
                  <option
                    v-for="lang in sortLanguages"
                    :key="lang.code"
                    :value="lang.code"
                    :disabled="(values.locales ?? []).some((l: LocaleEntry, i: number) => i !== index && l.code === lang.code)"
                  >
                    {{ lang.name.es }}
                  </option>
                </select>
                <button class="btn btn-sm btn-link text-danger p-0" @click="removeLocale(index)" aria-label="Remove locale">
                  <IconTrash :size="16" stroke-width="1.2" />
                </button>
              </div>
              <button class="btn btn-sm btn-outline-secondary" @click="addLocale">
                <IconPlus :size="14" stroke-width="1.2" class="me-1" />
                {{ t('sites.languages') }}
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeModal">
              {{ t('common.cancel') }}
            </button>
            <button class="btn btn-primary btn-sm" :disabled="formLoading || isDemo" @click="submitForm">
              {{ formLoading ? '...' : t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="deleteTarget" class="modal-backdrop show" />
    <div v-if="deleteTarget" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ t('common.deleteTitle') }}</h5>
            <button type="button" class="btn-close" @click="deleteTarget = null" aria-label="Close" />
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ t('common.deleteConfirm', { name: deleteTarget.name ?? `#${deleteTarget.id}` }) }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="deleteTarget = null">
              {{ t('common.cancel') }}
            </button>
            <button class="btn btn-danger btn-sm" :disabled="deletingIds.has(deleteTarget.id)" @click="deleteItem">
              {{ deletingIds.has(deleteTarget.id) ? '...' : t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
