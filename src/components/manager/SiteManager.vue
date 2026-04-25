<script lang="ts" setup>
import { IconPlus, IconTrash } from '@tabler/icons-vue'
import { siteOptions } from '@/types/defaultOptions'

const { t } = useI18n()
const { languages } = useReferenceData()
const st = siteStore()

const tableSchema: TableSchema = [
  { key: 'name', label: t('name') },
  { key: 'domain', label: t('domain') },
  { key: 'locales', label: t('sites.languages'), align: 'center' }
]

const filters: FilterSchemas = [
  { key: 'name', label: t('name') },
  { key: 'domain', label: t('domain') }
]

const createEditSchema: ColumnSchema[] = [
  { key: 'name', label: t('name'), required: true },
  { key: 'domain', label: t('domain'), required: true }
]

interface LocaleEntry {
  code: string
  is_default: boolean
}

const addLocale = (values: Record<string, any>, setFieldValue: (key: string, val: any) => void) => {
  const current: LocaleEntry[] = values.locales ?? []
  setFieldValue('locales', [...current, { code: '', is_default: current.length === 0 }])
}

const removeLocale = (index: number, values: Record<string, any>, setFieldValue: (key: string, val: any) => void) => {
  const current: LocaleEntry[] = values.locales ?? []
  const updated = current.filter((_: LocaleEntry, i: number) => i !== index)
  if (updated.length > 0 && !updated.some((l: LocaleEntry) => l.is_default)) {
    updated[0].is_default = true
  }
  setFieldValue('locales', updated)
}

const setDefaultLocale = (
  index: number,
  values: Record<string, any>,
  setFieldValue: (key: string, val: any) => void
) => {
  const current: LocaleEntry[] = values.locales ?? []
  setFieldValue(
    'locales',
    current.map((l: LocaleEntry, i: number) => ({ ...l, is_default: i === index }))
  )
}

const updateLocaleCode = (
  index: number,
  code: string,
  values: Record<string, any>,
  setFieldValue: (key: string, val: any) => void
) => {
  const current: LocaleEntry[] = values.locales ?? []
  setFieldValue(
    'locales',
    current.map((l: LocaleEntry, i: number) => (i === index ? { ...l, code } : l))
  )
}

const sortLanguages = computed(() => [...languages.value].sort((a, b) => a.name.es.localeCompare(b.name.es)))

const buildSiteQuery = (values: Record<string, any>) => {
  const defaultLoc = (values.locales || []).find((l: LocaleEntry) => l.is_default)
  return defaultLoc ? `?locale=${defaultLoc.code}` : ''
}
</script>

<template>
  <TableModel
    :schema="tableSchema"
    :create-edit-schema="createEditSchema"
    :filters="filters"
    url="/api/sites"
    :limit="10"
    :reverse="true"
    :title="t('sites.sites')"
    :create-initial-values="{ options: { ...siteOptions } }"
    :submit-query="buildSiteQuery"
  >
    <template #item-name="{ row, value }">
      <div @click="st.openSite(row.id)" class="btn btn-link p-0 text-decoration-none">{{ value }}</div>
    </template>

    <template #item-locales="{ row }">
      <template v-if="row.locales.length > 0">
        <span v-for="(locale, i) in row.locales" :key="locale.id ?? i" class="me-1">
          <span class="badge bg-secondary">{{ locale.code }}</span>
        </span>
      </template>
      <template v-else>-</template>
    </template>

    <template #form-extra="{ values, setFieldValue, setFieldError, editTarget }">
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
              @change="setDefaultLocale(index, values, setFieldValue)"
            />
            <label class="form-check-label" :title="t('sites.default_lang')">
              <small>{{ t('sites.default_lang') }}</small>
            </label>
          </div>
          <select
            class="form-select form-select-sm"
            :value="locale.code"
            :class="{ 'is-invalid': locale.code === '' }"
            @change="updateLocaleCode(index, ($event.target as HTMLSelectElement).value, values, setFieldValue)"
          >
            <option value="" disabled>{{ t('select') }}</option>
            <option
              v-for="lang in sortLanguages"
              :key="lang.code"
              :value="lang.code"
              :disabled="
                (values.locales ?? []).some((l: LocaleEntry, i: number) => i !== index && l.code === lang.code)
              "
            >
              {{ lang.name.es }}
            </option>
          </select>
          <button class="btn btn-sm btn-link text-danger p-0" @click="removeLocale(index, values, setFieldValue)">
            <IconTrash :size="16" stroke-width="1.2" />
          </button>
        </div>
        <button class="btn btn-sm btn-outline-secondary" @click="addLocale(values, setFieldValue)">
          <IconPlus :size="14" stroke-width="1.2" class="me-1" />
          {{ t('sites.languages') }}
        </button>
      </div>
    </template>
  </TableModel>
</template>
