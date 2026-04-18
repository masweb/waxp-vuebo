<script lang="ts" setup>
import { EditorContent } from '@tiptap/vue-3'
import { IconSettingsFilled, IconTrashFilled, IconArrowsMaximize, IconArrowsDiagonal2 } from '@tabler/icons-vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const ps = pageStore()
const hs = historyStore()
const stt = settingsStore()
const { editor, activate, deactivate, isActive } = useTipTap()

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
  if ((e.target as HTMLElement).closest('.blockui')) return
  if (props.block.type === 'Text') {
    if (!isBlockActive.value) activate(props.block)
  } else {
    ps.setActiveBlock(props.block)
  }
}

const deleteBlock = () => {
  if (isBlockActive.value) deactivate()
  hs.snapshot()
  const idx = props.section.blocks.findIndex(b => b.id === props.block.id)
  if (idx !== -1) props.section.blocks.splice(idx, 1)
  const { trimRows } = useGridConversion()
  trimRows(props.section)
  ps.setActiveBlock(null)
}

const blockSettings = () => {
  if (props.block.type === 'Text') {
    if (!isBlockActive.value) activate(props.block)
  } else {
    ps.setActiveBlock(props.block)
  }
  stt.setSetting('BlockSettings')
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
    <button class="btn btn-sm btn-link blockui config" @click="blockSettings">
      <IconSettingsFilled size="18" />
    </button>
    <button class="btn btn-sm btn-link blockui delete" @click="deleteBlock">
      <IconTrashFilled size="18" />
    </button>
    <div class="blockui resize">
      <IconArrowsDiagonal2 size="18" />
    </div>
  </div>
</template>
