<script lang="ts" setup>
const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const vp = viewportStore()
const pg = pageStore()
const apiBase = import.meta.env.VITE_END_POINT

const currentUrl = computed(() => {
  const img = props.block.image
  if (!img) return ''
  const mode = vp.mode
  const url = mode === 'mobile'
    ? (img.url_mob || img.url_tab || img.url_desk)
    : mode === 'tablet'
      ? (img.url_tab || img.url_desk)
      : img.url_desk
  return url ? `${apiBase}${url}` : ''
})

const altText = computed(() => {
  return props.block.locales?.alt || ''
})

const imgStyle = computed(() => {
  const img = props.block.image
  if (!img) return {}
  if (img.fit === 'cover') return { width: '100%', height: '100%', objectFit: 'cover' }
  return img.fit === 'height'
    ? { height: '100%', width: 'auto', maxWidth: 'none' }
    : { width: '100%', height: 'auto' }
})
</script>

<template>
  <div ref="blockRef" class="block image-block" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <img
      v-if="currentUrl"
      :src="currentUrl"
      :alt="altText"
      :style="imgStyle"
      class="image-block__img"
      loading="lazy"
    />
    <div class="blockui resize"></div>
  </div>
</template>
