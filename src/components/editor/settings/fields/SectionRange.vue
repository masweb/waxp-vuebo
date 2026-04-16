<script lang="ts" setup>
const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  min?: number
  max?: number
  step?: number
}>(), {
  min: 1,
  max: 48,
  step: 1,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const local = ref(props.modelValue)

watch(() => props.modelValue, v => { local.value = v })
watch(local, v => emit('update:modelValue', v))
</script>

<template>
  <div class="mb-2">
    <label v-if="label" class="form-label small mb-1">{{ label }}</label>
    <div class="d-flex align-items-center gap-2">
      <CFormRange v-model="local" :min="min" :max="max" :step="step" />
      <input
        type="number"
        class="form-control form-control-sm text-center p-0"
        style="width: 3.5rem"
        :value="local"
        :min="min"
        :max="max"
        :step="step"
        @input="local = String(($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
