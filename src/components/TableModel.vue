<script lang="ts" setup>
import { IconEditFilled, IconTrashFilled, IconArrowBigRightFilled, IconArrowBigLeftFilled } from '@tabler/icons-vue'

const props = withDefaults(
  defineProps<{
    schema: TableSchema
    url: string
    title: string
    createEditSchema?: ColumnSchema[]
    filters?: FilterSchemas
    limit?: number
    createInitialValues?: Record<string, any>
    submitQuery?: (values: Record<string, any>, isEdit: boolean) => string
    reverse?: boolean
  }>(),
  { limit: 25, createEditSchema: undefined, filters: undefined, createInitialValues: undefined, submitQuery: undefined, reverse: false }
)

const { t } = useI18n()

const data = ref<any[]>([])
const loading = ref(false)
const nextCursor = ref<number | null>(null)
const hasMore = ref(false)
const total = ref(0)
const isFirstPage = ref(true)
const currentPage = ref(1)
const showCreateModal = ref(false)
const editTarget = ref<any>(null)
const firstInput = ref<HTMLInputElement[]>([])
const formLoading = ref(false)
const deletingIds = ref<Set<number>>(new Set())
const deleteTarget = ref<any>(null)
const filterValues = ref<Record<string, string>>({})
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const activeFilterCount = computed(() => Object.values(filterValues.value).filter(v => v.trim()).length)

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
  filterValues.value = {}
  currentPage.value = 1
  fetchData()
}

const isFilterable = (key: string) => props.filters?.some(f => f.key === key)

const totalPages = computed(() => Math.ceil(total.value / props.limit))

const { errors, setFieldError, setFieldValue, resetForm, values } = useForm({
  validateOnMount: false,
  initialValues: {} as Record<string, string>
})

const isModalOpen = computed(() => showCreateModal.value || !!editTarget.value)

const validateForm = (): boolean => {
  let valid = true
  for (const col of props.createEditSchema ?? []) {
    if (col.required && !values[col.key]?.trim()) {
      setFieldError(col.key, t('validation.required'))
      valid = false
    }
  }
  return valid
}

const openCreateModal = () => {
  const initials: Record<string, any> = { ...props.createInitialValues }
  for (const col of props.createEditSchema ?? []) initials[col.key] = ''
  resetForm({ values: initials })
  editTarget.value = null
  showCreateModal.value = true
  setTimeout(() => firstInput.value[0]?.focus())
}

const openEditModal = (row: any) => {
  const initials: Record<string, any> = { ...row }
  for (const col of props.createEditSchema ?? []) {
    if (initials[col.key] == null) initials[col.key] = ''
  }
  delete initials.id
  delete initials.created_at
  delete initials.updated_at
  resetForm({ values: initials })
  editTarget.value = row
  showCreateModal.value = false
  setTimeout(() => firstInput.value[0]?.focus())
}

const closeModal = () => {
  showCreateModal.value = false
  editTarget.value = null
}

const submitForm = async () => {
  if (!validateForm()) return
  formLoading.value = true
  const query = props.submitQuery?.(values, !!editTarget.value) ?? ''
  try {
    if (editTarget.value) await useApi(`${props.url}/${editTarget.value.id}${query}`, { method: 'PUT', body: { ...values } })
    else await useApi(`${props.url}${query}`, { method: 'POST', body: { ...values } })
    closeModal()
    await fetchData()
  } catch (error: any) {
    const apiError = error?.data as ApiError
    if (apiError) errorsStore().addError(apiError)
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (row: any) => {
  deleteTarget.value = row
}

const deleteItem = async () => {
  const row = deleteTarget.value
  if (!row || deletingIds.value.has(row.id)) return
  deletingIds.value.add(row.id)
  try {
    await useApi(`${props.url}/${row.id}`, { method: 'DELETE' })
    total.value--
    deleteTarget.value = null
    if (!data.value.length && !isFirstPage.value) prevPage()
    else data.value = data.value.filter(item => item.id !== row.id)
  } catch {
  } finally {
    deletingIds.value.delete(row.id)
  }
}

const buildUrl = (cursor?: number) => {
  const params = new URLSearchParams()
  params.set('limit', String(props.limit))
  if (cursor) params.set('cursor', String(cursor))
  for (const filter of props.filters ?? []) {
    const val = filterValues.value[filter.key]?.trim()
    if (val) params.set(`filter[${filter.key}_like]`, val)
  }
  const sep = props.url.includes('?') ? '&' : '?'
  return `${props.url}${sep}${params.toString()}`
}

const fetchData = async (cursor?: number) => {
  loading.value = true
  try {
    const res = await useApi(buildUrl(cursor))
    const items = res.data ?? res
    data.value = props.reverse ? [...items].reverse() : items
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

const alignClass = (align?: ColumnAlign) => {
  if (!align) return ''
  return `text-${align}`
}

defineExpose({ data, fetchData })

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0 ms-2">{{ props.title }}</h5>
        <button v-if="createEditSchema" class="btn btn-outline-primary btn-sm" @click="openCreateModal">
          + {{ t('common.add') }} {{ props.title }}
        </button>
      </div>
      <div class="card-body pt-1">
        <table class="table table-hover">
          <thead>
            <tr>
              <th v-for="col in schema" :key="col.key" :class="alignClass(col.align)">
                {{ col.label ?? col.key }}
              </th>
              <th v-if="activeFilterCount" class="text-end">
                <button class="btn btn-sm btn-link p-0 text-danger" @click="clearFilters">
                  {{ t('common.clearFilters') }}
                </button>
              </th>
              <th v-else class="text-end" />
            </tr>
            <tr v-if="filters">
              <th v-for="col in schema" :key="col.key">
                <input
                  v-if="isFilterable(col.key)"
                  :value="filterValues[col.key]"
                  class="form-control form-control-sm"
                  :placeholder="t('common.filter') + '...'"
                  @input="onFilterInput(col.key, ($event.target as HTMLInputElement).value)"
                />
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td :colspan="schema.length + 1" class="text-center py-4">
                <span class="spinner-border spinner-border-sm me-2" role="status" />
                {{ t('loading') }}
              </td>
            </tr>
            <tr v-for="(row, idx) in data" :key="idx">
              <td v-for="col in schema" :key="col.key" :class="alignClass(col.align)">
                <slot :name="`item-${col.key}`" :row="row" :value="row[col.key]">
                  {{ row[col.key] }}
                </slot>
              </td>
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end">
                  <button v-if="createEditSchema" class="btn btn-sm btn-link p-0" @click="openEditModal(row)">
                    <IconEditFilled :size="22" stroke-width="1.2" />
                  </button>
                  <button
                    class="btn btn-sm btn-link p-0"
                    :disabled="deletingIds.has(row.id)"
                    @click="confirmDelete(row)"
                  >
                    <IconTrashFilled :size="22" stroke-width="1.2" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !data.length">
              <td :colspan="schema.length + 1" class="text-center text-muted py-4">
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
            <button class="btn btn-outline-secondary" :disabled="isFirstPage" @click="prevPage">
              <IconArrowBigLeftFilled />
            </button>
            <button
              class="btn btn-outline-secondary"
              :disabled="!hasMore || currentPage >= totalPages"
              @click="nextPage"
            >
              <IconArrowBigRightFilled />
            </button>
          </div>
        </nav>
      </div>
    </div>

    <div v-if="isModalOpen && createEditSchema" class="modal-backdrop show" />
    <div v-if="isModalOpen && createEditSchema" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editTarget ? t('common.edit') : t('common.add') }} {{ props.title }}</h5>
            <button type="button" class="btn-close" @click="closeModal" />
          </div>
          <div class="modal-body">
            <div v-for="col in createEditSchema" :key="col.key" class="mb-3">
              <label class="form-label">
                {{ col.label ?? col.key }}
                <span v-if="col.required" class="text-danger">*</span>
              </label>
              <input
                ref="firstInput"
                :value="values[col.key]"
                class="form-control"
                :class="{ 'is-invalid': errors[col.key] }"
                @input="setFieldValue(col.key, ($event.target as HTMLInputElement).value)"
                @keyup.enter="submitForm"
              />
              <div v-if="errors[col.key]" class="invalid-feedback">{{ errors[col.key] }}</div>
            </div>
            <slot
              name="form-extra"
              :values="values"
              :set-field-value="setFieldValue"
              :set-field-error="setFieldError"
              :errors="errors"
              :edit-target="editTarget"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeModal">
              {{ t('common.cancel') }}
            </button>
            <button class="btn btn-primary btn-sm" :disabled="formLoading" @click="submitForm">
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
            <button type="button" class="btn-close" @click="deleteTarget = null" />
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
