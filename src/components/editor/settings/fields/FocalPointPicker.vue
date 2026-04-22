<script lang="ts" setup>
const props = defineProps<{
  imageUrl: string
  focalX: string
  focalY: string
  zoom: string
}>()

const emit = defineEmits<{
  (e: 'update:position', x: string, y: string): void
  (e: 'update:zoom', v: string): void
}>()

const { t } = useI18n()
const containerRef = ref<HTMLElement>()
const dragging = ref(false)

const previewScale = computed(() => Math.max(Number(props.zoom || 100) / 100, 1.15))

const imageStyle = computed(() => ({
  backgroundImage: `url('${props.imageUrl}')`,
  backgroundSize: 'cover',
  backgroundPosition: `${props.focalX || 50}% ${props.focalY || 50}%`,
  transform: `scale(${previewScale.value})`,
  transformOrigin: `${props.focalX || 50}% ${props.focalY || 50}%`
}))

const onPointerDown = (e: PointerEvent) => {
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  updateFromPointer(e)
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value) return
  updateFromPointer(e)
}

const onPointerUp = () => {
  dragging.value = false
}

const updateFromPointer = (e: PointerEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  let x = ((e.clientX - rect.left) / rect.width) * 100
  let y = ((e.clientY - rect.top) / rect.height) * 100
  x = Math.round(Math.max(0, Math.min(100, x)))
  y = Math.round(Math.max(0, Math.min(100, y)))
  emit('update:position', String(x), String(y))
}
</script>

<template>
  <div>
    <div
      ref="containerRef"
      class="focal-picker"
      :class="{ 'focal-picker--dragging': dragging }"
      @pointerdown.prevent="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    >
      <div class="focal-picker__image" :style="imageStyle" />
      <div class="focal-picker__grid">
        <div class="focal-picker__line focal-picker__line--h" style="top: 33.33%" />
        <div class="focal-picker__line focal-picker__line--h" style="top: 66.66%" />
        <div class="focal-picker__line focal-picker__line--v" style="left: 33.33%" />
        <div class="focal-picker__line focal-picker__line--v" style="left: 66.66%" />
      </div>
      <div class="focal-picker__point" :style="{ left: `${focalX || 50}%`, top: `${focalY || 50}%` }" />
    </div>
    <SectionRange
      :modelValue="Number(zoom || 100)"
      :label="t('background.zoom')"
      :min="100"
      :max="300"
      :step="5"
      @update:modelValue="emit('update:zoom', String($event))"
    />
  </div>
</template>

<style scoped>
.focal-picker {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  cursor: crosshair;
  border-radius: 4px;
  border: 1px solid var(--bs-border-color);
  user-select: none;
  -webkit-user-select: none;
  background: var(--bs-body-bg);
}

.focal-picker--dragging {
  cursor: grabbing;
}

.focal-picker__image {
  position: absolute;
  inset: 0;
  pointer-events: none;
  will-change: transform;
}

.focal-picker__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.focal-picker__line {
  position: absolute;
  background: rgba(255, 255, 255, 0.25);
}

.focal-picker__line--h {
  left: 0;
  right: 0;
  height: 1px;
}

.focal-picker__line--v {
  top: 0;
  bottom: 0;
  width: 1px;
}

.focal-picker__point {
  position: absolute;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
}

.focal-picker__point::before,
.focal-picker__point::after {
  content: '';
  position: absolute;
  background: white;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.6);
}

.focal-picker__point::before {
  width: 20px;
  height: 2px;
  top: 9px;
  left: 0;
}

.focal-picker__point::after {
  width: 2px;
  height: 20px;
  left: 9px;
  top: 0;
}
</style>
