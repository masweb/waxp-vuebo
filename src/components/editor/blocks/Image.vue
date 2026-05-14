<script lang="ts" setup>
import { IconPhoto } from '@tabler/icons-vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const { hasLink, onBlockClick, onMouseDown: onLinkMouseDown, isDrag: isLinkDrag } = useBlockLink(() => props.block)

const vp = viewportStore()
const pg = pageStore()
const st = siteStore()
const apiBase = import.meta.env.VITE_END_POINT

const isDark = computed(() => !!st.site?.options.darkMode)

const hasLightbox = computed(() => !!props.block.image?.lightbox)

const lightboxOpen = ref(false)

const currentUrl = computed(() => {
  const img = props.block.image
  if (!img) return ''
  const mode = vp.mode
  const dark = isDark.value
  const url = dark
    ? mode === 'mobile'
      ? img.url_mob_dark || img.url_tab_dark || img.url_desk_dark || img.url_mob || img.url_tab || img.url_desk
      : mode === 'tablet'
        ? img.url_tab_dark || img.url_desk_dark || img.url_tab || img.url_desk
        : img.url_desk_dark || img.url_desk
    : mode === 'mobile'
      ? img.url_mob || img.url_tab || img.url_desk
      : mode === 'tablet'
        ? img.url_tab || img.url_desk
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
  return img.fit === 'height' ? { height: '100%', width: 'auto', maxWidth: 'none' } : { width: '100%', height: 'auto' }
})

const blockWidth = ref(0)
const blockHeight = ref(0)

const placeholderSize = computed(() => {
  const scale = 2
  const w = Math.round(blockWidth.value * scale)
  const h = Math.round(blockHeight.value * scale)
  return w > 0 && h > 0 ? `${w} × ${h}` : ''
})

let resizeObs: ResizeObserver | null = null

const openLightbox = (e: MouseEvent) => {
  if (isLinkDrag(e)) return
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const onLightboxKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeLightbox()
}

onMounted(() => {
  if (blockRef.value) {
    resizeObs = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) {
        blockWidth.value = Math.round(entry.contentRect.width)
        blockHeight.value = Math.round(entry.contentRect.height)
      }
    })
    resizeObs.observe(blockRef.value)
  }
})

onUnmounted(() => {
  resizeObs?.disconnect()
})

watch(lightboxOpen, open => {
  if (open) {
    document.addEventListener('keydown', onLightboxKey)
  } else {
    document.removeEventListener('keydown', onLightboxKey)
  }
})
</script>

<template>
  <div
    ref="blockRef"
    class="block image-block"
    :class="{ 'block-link': hasLink || hasLightbox }"
    :style="blockStyle"
    @contextmenu="onContextMenu"
    @mousedown="onLinkMouseDown"
    @click="
      e => {
        if ((e.target as HTMLElement).closest('.blockui')) return
        if (isLinkDrag(e)) return
        onBlockClick()
      }
    "
  >
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <img
      v-if="hasLightbox && currentUrl"
      :src="currentUrl"
      :alt="altText"
      :style="imgStyle"
      class="image-block__img lb-trigger"
      loading="lazy"
      @mousedown="onLinkMouseDown"
      @click.stop="openLightbox"
    />
    <img
      v-else-if="currentUrl"
      :src="currentUrl"
      :alt="altText"
      :style="imgStyle"
      class="image-block__img"
      loading="lazy"
    />
    <div v-else class="image-block__placeholder">
      <IconPhoto :size="24" :stroke-width="1" />
      <span v-if="placeholderSize" class="image-block__placeholder-size">{{ placeholderSize }}</span>
    </div>
    <div class="blockui resize"></div>
  </div>

  <Teleport to="body">
    <div v-if="lightboxOpen" class="lb-overlay" @click="closeLightbox">
      <img :src="currentUrl" :alt="altText" class="lb-img" @click.stop />
      <button class="lb-close" @click.stop="closeLightbox">&times;</button>
    </div>
  </Teleport>
</template>

<style scoped>
.lb-trigger {
  cursor: zoom-in;
}

.lb-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  cursor: zoom-out;
}

:root[data-theme='dark'] .lb-overlay {
  background: rgba(0, 0, 0, 0.92);
}

.lb-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
}

.lb-close {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 32px;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  user-select: none;
  padding: 4px 8px;
}
</style>
