<script lang="ts" setup>
import type { Font, Fonts } from '@/types/defaultOptions'

const props = defineProps<{
  modelValue: Font
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Font]
}>()

const { t } = useI18n()
const st = siteStore()
const { site } = storeToRefs(st)

const fonts = computed(() => site.value?.options?.fonts ?? [])

const query = ref(props.modelValue.family)
const isOpen = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const highlightedIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  const list = fonts.value
  if (!query.value.trim()) return list
  const q = query.value.toLowerCase()
  return list.filter(f => f.family.toLowerCase().includes(q))
})

watch(
  () => props.modelValue.family,
  val => {
    if (!isOpen.value) query.value = val
  }
)

watch(isOpen, open => {
  if (open) {
    highlightedIndex.value = -1
    query.value = ''
  } else {
    query.value = props.modelValue.family
  }
})

const onInput = (e: Event) => {
  query.value = (e.target as HTMLInputElement).value
  isOpen.value = true
  highlightedIndex.value = -1
}

const onFocus = () => {
  isOpen.value = true
  highlightedIndex.value = -1
}

const scrollItemIntoView = (index: number) => {
  nextTick(() => {
    const dropdown = dropdownRef.value
    if (!dropdown) return
    const items = dropdown.querySelectorAll('.font-dropdown-item')
    const el = items[index] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  })
}

const onKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) return
  const total = filtered.value.length

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = total === 0 ? -1 : (highlightedIndex.value + 1) % total
    scrollItemIntoView(highlightedIndex.value)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = total === 0 ? -1 : (highlightedIndex.value - 1 + total) % total
    scrollItemIntoView(highlightedIndex.value)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (highlightedIndex.value >= 0 && highlightedIndex.value < total) {
      pickFamily(filtered.value[highlightedIndex.value])
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

const currentFont = computed<Fonts | undefined>(() => fonts.value.find(f => f.family === props.modelValue.family))

const variantCount = (font: Fonts) => {
  return font.weights.length + (font.italics?.length ?? 0)
}

const variantOptions = computed(() => {
  if (!currentFont.value) return []
  const opts: { weight: number; italic: boolean; label: string }[] = []
  for (const w of currentFont.value.weights) {
    opts.push({ weight: w, italic: false, label: `${w}` })
  }
  for (const w of currentFont.value.italics ?? []) {
    opts.push({ weight: w, italic: true, label: `${w} italic` })
  }
  return opts
})

const selectedVariant = computed({
  get: () => {
    const idx = variantOptions.value.findIndex(
      v => v.weight === props.modelValue.weight && v.italic === !!props.modelValue.italic
    )
    return idx >= 0 ? String(idx) : ''
  },
  set: (v: string) => {
    const opt = variantOptions.value[Number(v)]
    if (opt) emit('update:modelValue', { ...props.modelValue, weight: opt.weight, italic: opt.italic })
  }
})

const pickFamily = (font: Fonts) => {
  emit('update:modelValue', {
    family: font.family,
    weight: font.weights[0] ?? 400,
    italic: false
  })
  isOpen.value = false
}

const clearFamily = () => {
  emit('update:modelValue', { family: '', weight: 400, italic: false })
  query.value = ''
  isOpen.value = false
  nextTick(() => inputRef.value?.focus())
}

const onDocClick = (e: MouseEvent) => {
  if (!containerRef.value?.contains(e.target as Node)) {
    isOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="containerRef" class="font-family-field mb-3">
    <label v-if="label" class="mb-1">{{ label }}</label>
    <div class="font-search-row">
      <div class="font-search-input-wrap">
        <input
          ref="inputRef"
          class="form-control form-control-sm font-search-input"
          type="text"
          :value="isOpen ? query : modelValue.family"
          :placeholder="t('fonts.searchPlaceholder')"
          autocomplete="off"
          @input="onInput"
          @focus="onFocus"
          @keydown="onKeydown"
        />
        <button
          v-if="modelValue.family"
          class="font-clear-btn"
          type="button"
          :title="t('fonts.removeFont')"
          @click="clearFamily"
        >
          ×
        </button>
      </div>

      <div v-if="isOpen" ref="dropdownRef" class="font-dropdown">
        <button
          v-for="(font, idx) in filtered"
          :key="font.family"
          type="button"
          class="font-dropdown-item"
          :class="{ active: font.family === modelValue.family, highlighted: highlightedIndex === idx }"
          @click="pickFamily(font)"
        >
          <span class="font-dropdown-family">{{ font.family }}</span>
          <span class="font-dropdown-category"> {{ variantCount(font) }} {{ t('fonts.variants') }} </span>
        </button>
        <div v-if="!filtered.length && query.length > 1" class="font-dropdown-empty">{{ t('common.noResults') }}</div>
      </div>
    </div>

    <div v-if="currentFont" class="mt-1">
      <select class="form-select form-select-sm" v-model="selectedVariant">
        <option v-for="(opt, idx) in variantOptions" :key="idx" :value="String(idx)">{{ opt.label }}</option>
      </select>
    </div>
  </div>
</template>
