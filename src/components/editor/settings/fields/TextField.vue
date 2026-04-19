<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const local = ref(props.modelValue)

watch(
  () => props.modelValue,
  v => {
    local.value = v
  }
)
watch(local, v => emit('update:modelValue', v))
</script>

<template>
  <div class="mb-2">
    <label v-if="label" class="form-label mb-1">{{ label }}</label>
    <input type="text" class="form-control" v-model="local" :placeholder="placeholder" />
  </div>
</template>
