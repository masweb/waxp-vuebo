<script lang="ts" setup>
import { EditorContent } from '@tiptap/vue-3'
import { IconSettingsFilled, IconTrashFilled, IconArrowsMaximize, IconArrowsDiagonal2 } from '@tabler/icons-vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const pg = pageStore()
const { editor, activate, isActive } = useTipTap()

const blockRef = ref<HTMLElement>()

const { blockStyle } = useBlockGrid(() => props.block)

useMoveBlock(
  blockRef,
  () => props.block,
  () => props.section
)

useResizeBlock(
  blockRef,
  () => props.block,
  () => props.section
)

const isBlockActive = computed(() => isActive(props.block.id))

const onBlockClick = (e: MouseEvent) => {
  if (props.block.type !== 'Text') return
  if ((e.target as HTMLElement).closest('.blockui')) return
  if (!isBlockActive.value) {
    activate(props.block)
  }
}
</script>

<template>
  <div
    ref="blockRef"
    class="block"
    :class="{ 'block--active': isBlockActive }"
    :style="blockStyle"
    @click="onBlockClick"
  >
    <template v-if="block.type === 'Text'">
      <EditorContent v-if="isBlockActive" :editor="editor" />
      <div v-else class="tiptap tiptap-readonly" v-html="block.content" />
    </template>
    <template v-else>
      {{ block.content }}
    </template>

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
