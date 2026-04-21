<script lang="ts" setup>
import { IconRadiusBottomRight } from '@tabler/icons-vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)
</script>

<template>
  <div ref="blockRef" class="block" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <div class="blockui resize">
      <IconRadiusBottomRight size="18" />
    </div>
  </div>
</template>
