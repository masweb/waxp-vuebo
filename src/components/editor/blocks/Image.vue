<script lang="ts" setup>
const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, deleteBlock, blockSettings } = useBlockBase(
  () => props.block,
  () => props.section
)
</script>

<template>
  <div ref="blockRef" class="block" :style="blockStyle">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <BlockControls :on-delete="deleteBlock" :on-settings="blockSettings" />
  </div>
</template>
