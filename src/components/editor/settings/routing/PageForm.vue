<script setup lang="ts">
import { IconDeviceFloppy, IconX, IconAlertCircle } from '@tabler/icons-vue'

const props = defineProps<{
  page?: Page
  parentId?: number | null
  locales: string[]
  isRoot?: boolean
  existingPages: Page[]
}>()

const emit = defineEmits<{
  save: [data: CreatePageRequest | UpdatePageRequest, pageId?: number]
  cancel: []
}>()

const { t } = useI18n()

const activeTab = ref(props.locales[0] || 'es')
const saving = ref(false)
const attemptedSubmit = ref(false)
const fieldErrors = ref<Record<string, string>>({})

const buildInitialValues = () => {
  const values: Record<string, string> = {}
  for (const loc of props.locales) {
    const slug = props.page?.slugs.find(s => s.locale_code === loc)
    const seo = props.page?.seo.find(s => s.locale_code === loc)
    values[`${loc}_slug`] = slug?.slug || ''
    values[`${loc}_seoTitle`] = seo?.title || ''
    values[`${loc}_seoDescription`] = seo?.description || ''
  }
  return values
}

const values = ref(buildInitialValues())

const clearFieldError = (key: string) => {
  delete fieldErrors.value[key]
}

const required = (val: string): true | string => {
  if (!val || !val.trim()) return t('validation.required')
  return true
}

const slugUnique = (slug: string, loc: string): true | string => {
  const s = slug.trim()
  if (!s) return true
  const siblings = props.existingPages.filter(p =>
    p.parent_id === (props.parentId ?? null) && p.id !== props.page?.id
  )
  const taken = siblings.some(p => p.slugs.some(sl => sl.locale_code === loc && sl.slug === s))
  if (taken) return t('validation.slugDuplicate')
  return true
}

const validateAll = (): boolean => {
  fieldErrors.value = {}
  let valid = true

  for (const loc of props.locales) {
    if (!props.isRoot) {
      const slugResult = required(values.value[`${loc}_slug`])
      if (slugResult !== true) {
        fieldErrors.value[`${loc}_slug`] = slugResult
        valid = false
      } else {
        const uniqueResult = slugUnique(values.value[`${loc}_slug`], loc)
        if (uniqueResult !== true) {
          fieldErrors.value[`${loc}_slug`] = uniqueResult
          valid = false
        }
      }
    }
    const titleResult = required(values.value[`${loc}_seoTitle`])
    if (titleResult !== true) {
      fieldErrors.value[`${loc}_seoTitle`] = titleResult
      valid = false
    }
  }

  return valid
}

const tabHasError = (loc: string) => {
  if (!attemptedSubmit.value) return false
  return !!fieldErrors.value[`${loc}_slug`] || !!fieldErrors.value[`${loc}_seoTitle`]
}

const handleSave = () => {
  attemptedSubmit.value = true

  if (!validateAll()) {
    const firstErrorTab = props.locales.find(loc => tabHasError(loc))
    if (firstErrorTab) activeTab.value = firstErrorTab
    return
  }

  saving.value = true

  const slugs: { locale_code: string; slug: string }[] = []
  const seo: { locale_code: string; title: string; description: string }[] = []

  for (const loc of props.locales) {
    slugs.push({ locale_code: loc, slug: values.value[`${loc}_slug`].trim() })
    seo.push({
      locale_code: loc,
      title: values.value[`${loc}_seoTitle`].trim(),
      description: values.value[`${loc}_seoDescription`].trim()
    })
  }

  if (props.page) {
    const updateData: UpdatePageRequest = { slugs, seo }
    emit('save', updateData, props.page.id)
  } else {
    const createData: CreatePageRequest = {
      type: 'page',
      parent_id: props.parentId ?? null,
      slugs,
      seo
    }
    emit('save', createData)
  }

  saving.value = false
}
</script>

<template>
  <div class="border rounded p-2 mb-2">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <small class="fw-semibold text-secondary">
        {{ page ? t('common.edit') : t('pages.add') }}
      </small>
      <button class="btn btn-link p-0 text-secondary" @click="emit('cancel')">
        <IconX :size="16" />
      </button>
    </div>

    <ul class="nav nav-tabs mb-2" style="font-size: 0.75rem">
      <li v-for="loc in locales" :key="loc" class="nav-item">
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

    <template v-for="loc in locales" :key="loc">
      <div v-show="activeTab === loc" class="mb-2">
        <div class="mb-2">
          <label class="form-label mb-1" style="font-size: 0.75rem">{{ t('slug') }}</label>
          <input
            v-model="values[`${loc}_slug`]"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': fieldErrors[`${loc}_slug`] }"
            :disabled="isRoot"
            @input="clearFieldError(`${loc}_slug`)"
          />
          <div v-if="fieldErrors[`${loc}_slug`]" class="invalid-feedback" style="font-size: 0.7rem">
            {{ fieldErrors[`${loc}_slug`] }}
          </div>
        </div>
        <div class="mb-2">
          <label class="form-label mb-1" style="font-size: 0.75rem">{{ t('pages.seo') }} - {{ t('title') }}</label>
          <input
            v-model="values[`${loc}_seoTitle`]"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': fieldErrors[`${loc}_seoTitle`] }"
            @input="clearFieldError(`${loc}_seoTitle`)"
          />
          <div v-if="fieldErrors[`${loc}_seoTitle`]" class="invalid-feedback" style="font-size: 0.7rem">
            {{ fieldErrors[`${loc}_seoTitle`] }}
          </div>
        </div>
        <div>
          <label class="form-label mb-1" style="font-size: 0.75rem"
            >{{ t('pages.seo') }} - {{ t('pages.description') }}</label
          >
          <textarea v-model="values[`${loc}_seoDescription`]" class="form-control form-control-sm" rows="2" />
        </div>
      </div>
    </template>

    <div class="d-flex gap-2 mt-2">
      <button class="btn btn-sm btn-primary" :disabled="saving" @click="handleSave">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1" />
        <IconDeviceFloppy v-else :size="14" class="me-1" />
        {{ t('common.save') }}
      </button>
      <button class="btn btn-sm btn-outline-secondary" @click="emit('cancel')">
        {{ t('common.cancel') }}
      </button>
    </div>
  </div>
</template>
