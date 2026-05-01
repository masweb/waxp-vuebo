<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { EditorContent } from '@tiptap/vue-3'

const props = defineProps<{
  block: Block
  section: Section
}>()

const router = useRouter()

const { editor, activate, startEditing, stopEditing, editing, isActive } = useTipTap()
const { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const isBlockActive = computed(() => isActive(props.block.id))

const localizedContent = computed(() => props.block.locales?.text || '')

const onBlockDblClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.blockui')) return
  if (!editing.value) startEditing(props.block)
}

const onReadonlyClick = (e: MouseEvent) => {
  const anchor = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null
  if (!anchor) return
  const href = anchor.getAttribute('href')
  if (href && href.startsWith('/')) {
    e.preventDefault()
    router.push(href)
  }
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
      <div v-else class="tiptap tiptap-readonly" v-html="localizedContent" @click="onReadonlyClick" />
    </div>

    <div class="blockui resize"></div>
  </div>
</template>
