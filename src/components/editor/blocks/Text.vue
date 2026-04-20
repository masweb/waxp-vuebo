<script lang="ts" setup>
import { EditorContent } from '@tiptap/vue-3'

const props = defineProps<{
  block: Block
  section: Section
}>()

const { editor, activate, deactivate, isActive } = useTipTap()
  const {
  blockRef,
  blockStyle,
  backgroundStyle,
  textStyle,
  deleteBlock: baseDelete,
  blockSettings: baseSettings
} = useBlockBase(
  () => props.block,
  () => props.section
)

const isBlockActive = computed(() => isActive(props.block.id))

const onBlockClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.blockui')) return
  if (!isBlockActive.value) activate(props.block)
}

const deleteBlock = () => {
  if (isBlockActive.value) deactivate()
  baseDelete()
}

const blockSettings = () => {
  if (!isBlockActive.value) activate(props.block)
  baseSettings()
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
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <div class="block-text-color" :style="textStyle">
      <EditorContent v-if="isBlockActive" :editor="editor" />
      <div v-else class="tiptap tiptap-readonly" v-html="block.content" />
    </div>

    <BlockControls :on-delete="deleteBlock" :on-settings="blockSettings" />
  </div>
</template>
