<script lang="ts" setup>
import { IconSettingsFilled, IconTrashFilled, IconArrowsMaximize, IconArrowsDiagonal2 } from '@tabler/icons-vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const blockRef = ref<HTMLElement>()

const { blockStyle } = useBlockGrid(() => props.block)

useMoveBlock(
  blockRef,
  () => props.block,
  () => props.section
)
</script>

<template>
  <div ref="blockRef" class="block" :style="blockStyle">
    {{ block.content }}

    <div class="blockui move">
      <IconArrowsMaximize size="16" />
    </div>

    <button class="btn btn-sm btn-link blockui config">
      <IconSettingsFilled size="18" />
    </button>
    <button class="btn btn-sm btn-link blockui delete">
      <IconTrashFilled size="18" />
    </button>
    <div class="blockui resize">
      <IconArrowsDiagonal2 size="18" />
    </div>
  </div>
</template>
