<script lang="ts" setup>
import {
  IconSettingsFilled,
  IconTrashFilled,
  IconArrowBigUpFilled,
  IconArrowBigDownFilled,
} from "@tabler/icons-vue";

const props = defineProps<{
  section: Section;
}>();

const { sectionRef, canvasRef, gridStyle, hovered, shouldShow } = useSectionGrid(
  () => props.section,
)

useNewBlock(sectionRef, () => props.section)
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
    <DrawingOverlay :section="section" :grid-style="gridStyle" />
    <button class="btn btn-sm btn-link sectionui moveup"><IconArrowBigUpFilled size="22" /></button>
    <button class="btn btn-sm btn-link sectionui movedown">
      <IconArrowBigDownFilled size="22" />
    </button>
    <button class="btn btn-sm btn-link sectionui config"><IconSettingsFilled size="22" /></button>
    <button class="btn btn-sm btn-link sectionui delete"><IconTrashFilled size="22" /></button>
  </div>

  <NewSection />
</template>
