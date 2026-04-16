<script lang="ts" setup>
import ColorPicker from '/public/colorpicker/colorpicker.min.js'
import '/public/colorpicker/colorpicker.min.css'

const props = withDefaults(
  defineProps<{
    color?: string
    label: string
  }>(),
  { color: undefined }
)

const emit = defineEmits<{
  (e: 'update:color', value: string): void
}>()

const inputRef = ref<HTMLInputElement>()

let picker: InstanceType<typeof ColorPicker> | null = null

onMounted(() => {
  if (!inputRef.value) return
  picker = new ColorPicker(inputRef.value, {
    color: props.color ?? null,
    defaultFormat: 'hex',
    submitMode: 'instant'
  })
  picker.on('pick', (color: any) => {
    emit('update:color', color?.string('hex') ?? '')
  })
})

watch(
  () => props.color,
  val => {
    if (picker && val !== undefined) {
      picker.setColor(val, false)
    }
  }
)

onBeforeUnmount(() => {
  picker?.destroy()
  picker = null
})
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-1">
    <label for="inputRef">{{ label }}</label>
    <input ref="inputRef" id="inputRef" type="hidden" />
  </div>
</template>
