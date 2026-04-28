<script lang="ts" setup>
const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const { hasLink, onBlockClick } = useBlockLink(() => props.block)

const vp = viewportStore()
const pg = pageStore()
const st = siteStore()
const apiBase = import.meta.env.VITE_END_POINT

const isDark = computed(() => !!st.site?.options.darkMode)

const currentUrl = computed(() => {
  const img = props.block.image
  if (!img) return ''
  const mode = vp.mode
  const dark = isDark.value
  const url =
    mode === 'mobile'
      ? (dark ? img.url_mob_dark || img.url_mob : false) || img.url_tab || img.url_desk
      : mode === 'tablet'
        ? (dark ? img.url_tab_dark || img.url_tab : false) || img.url_desk
        : (dark ? img.url_desk_dark || img.url_desk : img.url_desk)
  return url ? `${apiBase}${url}` : ''
})

const altText = computed(() => {
  return props.block.locales?.alt || ''
})

const imgStyle = computed(() => {
  const img = props.block.image
  if (!img) return {}
  if (img.fit === 'cover') return { width: '100%', height: '100%', objectFit: 'cover' }
  return img.fit === 'height' ? { height: '100%', width: 'auto', maxWidth: 'none' } : { width: '100%', height: 'auto' }
})

const onClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.blockui')) return
  onBlockClick()
}
</script>

<template>
  <div
    ref="blockRef"
    class="block image-block"
    :class="{ 'block-link': hasLink }"
    :style="blockStyle"
    @contextmenu="onContextMenu"
    @click="onClick"
  >
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <img v-if="currentUrl" :src="currentUrl" :alt="altText" :style="imgStyle" class="image-block__img" loading="lazy" />
    <div class="blockui resize"></div>
  </div>
</template>
