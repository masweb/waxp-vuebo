<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    modelValue: number
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
  (e: 'update:modelValue', value: number): void
}>()

const local = ref(String(props.modelValue))

watch(
  () => props.modelValue,
  v => {
    local.value = String(v)
  }
)
watch(local, v => emit('update:modelValue', Number(v)))
</script>

<template>
  <div class="mb-2">
    <label v-if="label" class="form-label mb-1">{{ label }}</label>
    <div class="d-flex align-items-center gap-2">
      <CFormRange v-model="local" :min="min" :max="max" :step="step" />
      <input
        type="number"
        class="form-control form-control-sm text-center p-0"
        style="width: 3.5rem"
        v-model="local"
        :min="min"
        :max="max"
        :step="step"
      />
    </div>
  </div>
</template>
