<script lang="ts" setup>
import { CFormLabel, CFormRange } from '@coreui/vue'

const props = withDefaults(
  defineProps<{
    range: string
    label?: string
    min?: number
    max?: number
    step?: number
  }>(),
  {
    min: 1,
    max: 48,
    step: 1
  }
)

const emit = defineEmits<{
  (e: 'update:range', value: string): void
}>()
const local = ref(props.range)
watch(
  () => props.range,
  v => {
    local.value = v
  }
)
</script>

<template>
  <div class="mb-2">
    <CFormLabel v-if="label" class="small mb-1">{{ label }}</CFormLabel>
    <div class="d-flex align-items-center gap-2">
      <CFormRange
        :model-value="range"
        :min="min"
        :max="max"
        :step="step"
        @update:model-value="emit('update:range', $event)"
      />
      <span class="small text-secondary" style="min-width: 1.5rem; text-align: right">{{ range }}</span>
    </div>
  </div>
</template>
