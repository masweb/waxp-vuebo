<script lang="ts" setup>
const props = defineProps<{
  section: Section
  gridStyle: Record<string, string | number>
}>()

const dr = drawingStore()
const { isDrawing, activeSectionId, coords } = storeToRefs(dr)

const isActive = computed(() => isDrawing.value && activeSectionId.value === props.section.id)
const hasValidCoords = computed(() => {
  const c = coords.value
  return c && c.w > 0 && c.h > 0
})

const selectionStyle = computed(() => {
  if (!isActive.value || !hasValidCoords.value) return { display: 'none' }
  const c = coords.value!
  return {
    gridColumn: `${c.x} / span ${c.w}`,
    gridRow: `${c.y} / span ${c.h}`
  }
})
</script>

<template>
  <div
    class="drawing-overlay"
    :style="{ ...gridStyle, display: 'grid', position: 'absolute', inset: '0', pointerEvents: 'none' }"
  >
    <div v-if="isActive && hasValidCoords" class="drawing-selection" :style="selectionStyle" />
  </div>
</template>
