<script lang="ts" setup>
const props = defineProps<{
  section: Section
}>()

const { sectionRef, canvasRef, gridStyle, hovered, shouldShow } = useSectionGrid(
  () => props.section,
)
</script>

<template>
  <div
    ref="sectionRef"
    class="section"
    :class="{ 'section--hovered': hovered, 'section--show-grid': shouldShow }"
    :style="gridStyle"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <canvas ref="canvasRef" class="section-canvas" />
    <PageBlock v-for="block in section.blocks" :key="block.id" :block="block" />
  </div>
  <NewSection />
</template>
