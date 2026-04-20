<script lang="ts" setup>
import { IconArrowBarUp, IconArrowBarRight, IconArrowBarDown, IconArrowBarLeft } from '@tabler/icons-vue'

const props = defineProps<{
  modelValue: Sides
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Sides): void
}>()

const sides: { key: keyof Sides; icon: any; placeholder: string }[] = [
  { key: 't', icon: IconArrowBarUp, placeholder: '0' },
  { key: 'r', icon: IconArrowBarRight, placeholder: '0' },
  { key: 'b', icon: IconArrowBarDown, placeholder: '0' },
  { key: 'l', icon: IconArrowBarLeft, placeholder: '0' }
]

const patch = (key: keyof Sides, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="mb-3">
    <label class="small fw-semibold d-block mb-1">{{ label }}</label>
    <div class="d-flex gap-1">
      <div v-for="s in sides" :key="s.key" class="d-flex align-items-center gap-1">
        <component :is="s.icon" :size="14" />
        <input
          type="text"
          class="form-control form-control-sm"
          style="width: 3.5rem"
          :value="modelValue[s.key]"
          :placeholder="s.placeholder"
          @input="patch(s.key, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
