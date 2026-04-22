<script lang="ts" setup>
import type { Fonts } from '@/types/defaultOptions'
import { IconTrashFilled, IconSelectAll, IconDeselect, IconTypography, IconItalic } from '@tabler/icons-vue'

const { t } = useI18n()
const st = siteStore()
const { site } = storeToRefs(st)
const hs = historyStore()
const { ready, results, init, search, getFont, injectWeights } = useGoogleFonts()

onMounted(() => {
  init()
})

const fonts = computed<Fonts[]>(() => site.value?.options?.fonts ?? [])
const globalFont = computed(() => site.value?.options?.globalFontFamily ?? { family: '', weight: 400, italic: false })

const isAdding = ref(false)
const searchQuery = ref('')
const selectedFamily = ref('')
const selectedWeights = ref<number[]>([400])
const selectedItalics = ref<number[]>([])

const showAddForm = () => {
  isAdding.value = true
  searchQuery.value = ''
  selectedFamily.value = ''
  selectedWeights.value = [400]
  selectedItalics.value = []
}

const cancelAdd = () => {
  isAdding.value = false
  searchQuery.value = ''
  selectedFamily.value = ''
  selectedWeights.value = [400]
  selectedItalics.value = []
}

const onSearchInput = (e: Event) => {
  searchQuery.value = (e.target as HTMLInputElement).value
  search(searchQuery.value)
}

const pickFamily = (family: string) => {
  selectedFamily.value = family
  searchQuery.value = ''
}

const clearPickedFamily = () => {
  selectedFamily.value = ''
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>('.fm-add-search input')
    el?.focus()
  })
}

const ALL_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const availableWeights = computed(() => {
  const font = getFont(selectedFamily.value)
  if (!font) return ALL_WEIGHTS
  return ALL_WEIGHTS.filter(w => {
    const v = w === 400 ? 'regular' : String(w)
    return font.variants.includes(v)
  })
})

const toggleWeight = (w: number) => {
  const idx = selectedWeights.value.indexOf(w)
  if (idx >= 0) {
    if (selectedWeights.value.length > 1) {
      selectedWeights.value.splice(idx, 1)
    }
  } else {
    selectedWeights.value.push(w)
  }
}

const availableItalics = computed(() => {
  const font = getFont(selectedFamily.value)
  if (!font) return ALL_WEIGHTS
  return ALL_WEIGHTS.filter(w => {
    const v = w === 400 ? 'regular' : String(w)
    return font.variants.includes(`${v}italic`)
  })
})

const toggleItalic = (w: number) => {
  const idx = selectedItalics.value.indexOf(w)
  if (idx >= 0) {
    selectedItalics.value.splice(idx, 1)
  } else {
    selectedItalics.value.push(w)
  }
}

const addFont = () => {
  if (!selectedFamily.value || selectedWeights.value.length === 0) return
  if (!site.value?.options) return
  hs.snapshot()

  const existing = fonts.value.find(f => f.family === selectedFamily.value)
  if (existing) {
    const mergedWeights = [...new Set([...existing.weights, ...selectedWeights.value])].sort((a, b) => a - b)
    const mergedItalics = [...new Set([...(existing.italics ?? []), ...selectedItalics.value])].sort((a, b) => a - b)
    const idx = site.value.options.fonts.indexOf(existing)
    site.value.options.fonts[idx] = { ...existing, weights: mergedWeights, italics: mergedItalics }
  } else {
    site.value.options.fonts.push({
      family: selectedFamily.value,
      weights: [...selectedWeights.value].sort((a, b) => a - b),
      italics: [...selectedItalics.value].sort((a, b) => a - b)
    })
  }

  injectWeights(selectedFamily.value, selectedWeights.value, selectedItalics.value)
  cancelAdd()
}

const removeFont = (family: string) => {
  if (!site.value?.options) return
  hs.snapshot()
  const idx = site.value.options.fonts.findIndex(f => f.family === family)
  if (idx >= 0) site.value.options.fonts.splice(idx, 1)

  if (globalFont.value.family === family) {
    const first = site.value.options.fonts[0]
    site.value.options.globalFontFamily = first
      ? { family: first.family, weight: first.weights[0] ?? 400, italic: false }
      : { family: '', weight: 400, italic: false }
  }
}

const editingFamily = ref<string | null>(null)
const editWeights = ref<number[]>([])
const editItalics = ref<number[]>([])

const startEdit = (font: Fonts) => {
  editingFamily.value = font.family
  editWeights.value = [...font.weights]
  editItalics.value = [...(font.italics ?? [])]
}

const cancelEdit = () => {
  editingFamily.value = null
  editWeights.value = []
  editItalics.value = []
}

const editSelectAll = (family: string) => {
  const available = weightsForFont(family)
  editWeights.value = [...available]
  editItalics.value = [...available]
}

const editDeselectAll = () => {
  editWeights.value = [400]
  editItalics.value = []
}

const editSelectAllWeights = (family: string) => {
  editWeights.value = [...weightsForFont(family)]
}

const editSelectAllItalics = (family: string) => {
  const font = getFont(family)
  if (!font) { editItalics.value = [...ALL_WEIGHTS]; return }
  editItalics.value = ALL_WEIGHTS.filter(w => {
    if (w === 400) return font.variants.includes('italic')
    return font.variants.includes(`${w}italic`)
  })
}

const saveEdit = () => {
  if (!editingFamily.value || !site.value?.options) return
  hs.snapshot()
  const font = site.value.options.fonts.find(f => f.family === editingFamily.value)
  if (!font) return

  font.weights = [...editWeights.value].sort((a, b) => a - b)
  font.italics = [...editItalics.value].sort((a, b) => a - b)
  injectWeights(font.family, font.weights, font.italics)

  if (globalFont.value.family === font.family) {
    const hasWeight = font.weights.includes(globalFont.value.weight)
    const hasItalic = globalFont.value.italic && (font.italics ?? []).includes(globalFont.value.weight)
    if (!hasWeight || (globalFont.value.italic && !hasItalic)) {
      site.value.options.globalFontFamily = {
        family: font.family,
        weight: font.weights[0] ?? 400,
        italic: false
      }
    }
  }

  editingFamily.value = null
  editWeights.value = []
  editItalics.value = []
}

const toggleEditWeight = (w: number) => {
  const idx = editWeights.value.indexOf(w)
  if (idx >= 0) {
    if (editWeights.value.length > 1) editWeights.value.splice(idx, 1)
  } else {
    editWeights.value.push(w)
  }
}

const toggleEditItalic = (w: number) => {
  const idx = editItalics.value.indexOf(w)
  if (idx >= 0) {
    editItalics.value.splice(idx, 1)
  } else {
    editItalics.value.push(w)
  }
}

const setGlobalFont = (family: string, weight: number, italic: boolean = false) => {
  if (!site.value?.options) return
  hs.snapshot()
  site.value.options.globalFontFamily = { family, weight, italic }
}

const globalWeightOptions = computed(() => {
  const f = fonts.value.find(f => f.family === globalFont.value.family)
  return f ? f.weights : [400]
})

const weightsForFont = (family: string): number[] => {
  const font = getFont(family)
  if (!font) return ALL_WEIGHTS
  return ALL_WEIGHTS.filter(w => {
    const v = w === 400 ? 'regular' : String(w)
    return font.variants.includes(v)
  })
}
</script>

<template>
  <div class="font-manager mb-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label class="form-label mb-0">{{ t('fonts.title') }}</label>
      <button class="btn btn-sm btn-outline-primary" @click="showAddForm" :disabled="!ready">
        + {{ t('fonts.add') }}
      </button>
    </div>

    <div v-if="isAdding" class="fm-add-form border rounded p-2 mb-2">
      <div v-if="!selectedFamily" class="fm-add-search">
        <input
          class="form-control form-control-sm mb-2"
          type="text"
          :value="searchQuery"
          :placeholder="t('fonts.search')"
          autocomplete="off"
          @input="onSearchInput"
        />
        <div class="fm-add-results" style="max-height: 180px; overflow-y: auto">
          <button
            v-for="font in results"
            :key="font.family"
            type="button"
            class="list-group-item list-group-item-action py-1 px-2 d-flex justify-content-between"
            :class="{ active: font.family === selectedFamily }"
            @click="pickFamily(font.family)"
          >
            <span>{{ font.family }}</span>
            <span class="text-muted small">{{ font.category }}</span>
          </button>
          <div v-if="!results.length && searchQuery.length > 1 && ready" class="text-muted small p-2">
            {{ t('common.noResults') }}
          </div>
        </div>
      </div>

      <div v-else class="fm-add-pick">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong>{{ selectedFamily }}</strong>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="clearPickedFamily">
            {{ t('fonts.change') }}
          </button>
        </div>

        <div class="mb-2">
          <label class="small mb-1">{{ t('fonts.weights') }}</label>
          <div class="d-flex flex-wrap gap-1">
            <button
              v-for="w in availableWeights"
              :key="w"
              type="button"
              class="btn btn-sm"
              :class="selectedWeights.includes(w) ? 'btn-primary' : 'btn-outline-secondary'"
              @click="toggleWeight(w)"
            >
              {{ w }}
            </button>
          </div>
        </div>

        <div v-if="availableItalics.length > 0" class="mb-2">
          <label class="small mb-1">{{ t('fonts.italic') }}</label>
          <div class="d-flex flex-wrap gap-1">
            <button
              v-for="w in availableItalics"
              :key="w"
              type="button"
              class="btn btn-sm"
              :class="selectedItalics.includes(w) ? 'btn-primary' : 'btn-outline-secondary'"
              @click="toggleItalic(w)"
            >
              {{ w }}i
            </button>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" @click="addFont" :disabled="selectedWeights.length === 0">
            {{ t('common.add') }}
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="cancelAdd">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <div class="fm-list">
      <div v-for="font in fonts" :key="font.family" class="fm-font-item border rounded p-2 mb-2">
        <div class="d-flex justify-content-between align-items-center">
          <div class="fw-semibold">{{ font.family }}</div>
          <div v-if="editingFamily !== font.family" class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-secondary" @click="startEdit(font)">
              {{ t('fonts.weights') }}
            </button>
            <button class="btn btn-sm btn-danger" @click="removeFont(font.family)"><IconTrashFilled :size="16" /></button>
          </div>
          <div v-else class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-secondary" @click="editSelectAll(font.family)" :title="t('fonts.selectAll')"><IconSelectAll :size="16" /></button>
            <button class="btn btn-sm btn-outline-secondary" @click="editDeselectAll" :title="t('fonts.deselectAll')"><IconDeselect :size="16" /></button>
            <button class="btn btn-sm btn-outline-secondary" @click="editSelectAllWeights(font.family)" :title="t('fonts.selectNormals')"><IconTypography :size="16" /></button>
            <button class="btn btn-sm btn-outline-secondary" @click="editSelectAllItalics(font.family)" :title="t('fonts.selectItalics')"><IconItalic :size="16" /></button>
          </div>
        </div>

        <div v-if="editingFamily === font.family" class="mt-2">
          <div class="d-flex flex-wrap gap-1 mb-2">
            <button
              v-for="w in ALL_WEIGHTS"
              :key="w"
              type="button"
              class="btn btn-sm"
              :class="editWeights.includes(w) ? 'btn-primary' : 'btn-outline-secondary'"
              :disabled="!weightsForFont(font.family).includes(w)"
              @click="toggleEditWeight(w)"
            >
              {{ w }}
            </button>
          </div>
          <div class="d-flex flex-wrap gap-1 mb-2">
            <button
              v-for="w in ALL_WEIGHTS"
              :key="'i'+w"
              type="button"
              class="btn btn-sm"
              :class="editItalics.includes(w) ? 'btn-primary' : 'btn-outline-secondary'"
              :disabled="!weightsForFont(font.family).includes(w)"
              @click="toggleEditItalic(w)"
            >
              {{ w }}i
            </button>
          </div>
          <div class="d-flex justify-content-between mt-2 pt-2 border-top">
            <button class="btn btn-sm btn-outline-secondary" @click="cancelEdit">{{ t('common.cancel') }}</button>
            <button class="btn btn-sm btn-primary" @click="saveEdit">{{ t('common.save') }}</button>
          </div>
        </div>

        <div v-else class="mt-1">
          <span v-for="w in font.weights" :key="w" class="badge bg-secondary me-1">{{ w }}</span>
          <span v-for="w in (font.italics ?? [])" :key="'i'+w" class="badge bg-primary me-1">{{ w }}i</span>
        </div>
      </div>

      <div v-if="!fonts.length" class="text-muted small">{{ t('fonts.empty') }}</div>
    </div>

    <div v-if="fonts.length > 0" class="mt-3">
      <label class="form-label mb-1">{{ t('fonts.globalFont') }}</label>
      <div class="d-flex gap-2 align-items-center">
        <select
          class="form-select form-select-sm"
          style="max-width: 200px"
          :value="globalFont.family"
          @change="setGlobalFont(($event.target as HTMLSelectElement).value, globalWeightOptions[0] ?? 400, globalFont.italic ?? false)"
        >
          <option v-for="f in fonts" :key="f.family" :value="f.family">{{ f.family }}</option>
        </select>
        <select
          class="form-select form-select-sm"
          style="max-width: 100px"
          :value="globalFont.weight"
          @change="setGlobalFont(globalFont.family, Number(($event.target as HTMLSelectElement).value), globalFont.italic ?? false)"
        >
          <option v-for="w in globalWeightOptions" :key="w" :value="w">{{ w }}</option>
        </select>
        <label class="form-check form-check-inline mb-0">
          <input
            class="form-check-input"
            type="checkbox"
            :checked="globalFont.italic ?? false"
            @change="setGlobalFont(globalFont.family, globalFont.weight, ($event.target as HTMLInputElement).checked)"
          />
          <span class="small">{{ t('fonts.italic') }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
