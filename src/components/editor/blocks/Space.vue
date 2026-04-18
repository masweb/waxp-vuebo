<script lang="ts" setup>
const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, deleteBlock, blockSettings } = useBlockBase(
  () => props.block,
  () => props.section
)
</script>

<template>
  <div ref="blockRef" class="block" :style="blockStyle">
    Spacer
    <BlockControls :on-delete="deleteBlock" :on-settings="blockSettings" />
  </div>
</template>
