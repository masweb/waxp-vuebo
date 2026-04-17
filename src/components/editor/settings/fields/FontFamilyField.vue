<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { ready, results, init, search, getFont, loadPreview } = useGoogleFonts()

onMounted(() => {
  init()
})

const query = ref(props.modelValue)
const isOpen = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const highlightedIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)

watch(
  () => props.modelValue,
  val => {
    query.value = val
  }
)

watch(isOpen, open => {
  if (open) {
    highlightedIndex.value = -1
  }
})

const onInput = (e: Event) => {
  query.value = (e.target as HTMLInputElement).value
  isOpen.value = true
  highlightedIndex.value = -1
  search(query.value)
}

const onFocus = () => {
  isOpen.value = true
  highlightedIndex.value = -1
  search(query.value)
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
  const total = results.value.length

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
      selectFamily(results.value[highlightedIndex.value].family)
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
    query.value = props.modelValue
  }
}

const selectFamily = (family: string) => {
  emit('update:modelValue', family)
  query.value = family
  isOpen.value = false
  loadPreview(family, 'regular')
}

const clearFamily = () => {
  emit('update:modelValue', '')
  query.value = ''
  isOpen.value = false
  nextTick(() => inputRef.value?.focus())
}

const onDocClick = (e: MouseEvent) => {
  if (!containerRef.value?.contains(e.target as Node)) {
    isOpen.value = false
    query.value = props.modelValue
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="containerRef" class="font-family-field mb-2">
    <label v-if="label" class="small mb-1">{{ label }}</label>
    <div class="font-search-row">
      <div class="font-search-input-wrap">
        <input
          ref="inputRef"
          class="form-control form-control-sm font-search-input"
          type="text"
          :value="isOpen ? query : modelValue"
          placeholder="Buscar fuente..."
          :disabled="!ready"
          autocomplete="off"
          @input="onInput"
          @focus="onFocus"
          @keydown="onKeydown"
        />
        <button
          v-if="modelValue"
          class="font-clear-btn"
          type="button"
          title="Quitar fuente"
          @click="clearFamily"
        >
          ×
        </button>
      </div>

      <div v-if="isOpen" ref="dropdownRef" class="font-dropdown">
        <button
          v-for="(font, idx) in results"
          :key="font.family"
          type="button"
          class="font-dropdown-item"
          :class="{ active: font.family === modelValue, highlighted: highlightedIndex === idx }"
          @click="selectFamily(font.family)"
        >
          <span class="font-dropdown-family">{{ font.family }}</span>
          <span class="font-dropdown-category">{{ font.category }}</span>
        </button>
        <div v-if="!results.length && query.length > 1 && ready" class="font-dropdown-empty">
          Sin resultados
        </div>
      </div>
    </div>
  </div>
</template>
