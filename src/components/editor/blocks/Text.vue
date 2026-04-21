<script lang="ts" setup>
import { EditorContent } from '@tiptap/vue-3'
import { IconRadiusBottomRight } from '@tabler/icons-vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const { editor, activate, startEditing, stopEditing, editing, isActive } = useTipTap()
const { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const isBlockActive = computed(() => isActive(props.block.id))

const onBlockDblClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.blockui')) return
  if (!editing.value) startEditing(props.block)
}
</script>

<template>
  <div
    ref="blockRef"
    class="block"
    :class="{ 'block--active': editing && isBlockActive }"
    :style="blockStyle"
    @dblclick="onBlockDblClick"
    @contextmenu="onContextMenu"
  >
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <div class="block-text-color" :style="textStyle">
      <EditorContent v-if="editing && isBlockActive" :editor="editor" />
      <div v-else class="tiptap tiptap-readonly" v-html="block.content" />
    </div>

    <div class="blockui resize">
      <IconRadiusBottomRight size="18" />
    </div>
  </div>
</template>
