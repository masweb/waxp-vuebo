<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { calcFluidFont, effectiveVpWidth } from '@/composables/useFontSize'

const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const router = useRouter()
const st = siteStore()
const vp = viewportStore()

const isDark = computed(() => !!st.site?.options.darkMode)
const mode = computed(() => (isDark.value ? 'dark' : 'light'))

const colors = computed(() => {
  const mc = props.block.menuColors
  if (!mc) return null
  return {
    color: mc.color[mode.value],
    hover: mc.hover[mode.value],
    active: mc.active[mode.value]
  }
})

const sectionTargetWidth = computed(() => {
  return props.section.style.maxWidth ?? st.site?.options.desktopWidth ?? 1200
})

const computeFontStyle = (fontSize: number | null, lineHeight: number | null) => {
  if (fontSize == null && lineHeight == null) return null
  const opts = st.site?.options
  if (!opts) return null
  const tw = sectionTargetWidth.value
  const fs = fontSize ?? opts.fontSize
  const lh = lineHeight ?? opts.lineHeight
  const fw = props.section.style.fullWidth ?? false
  const vw = effectiveVpWidth(vp)
  const result = calcFluidFont(fs, lh, tw, vw, vp.mode, fw, opts.desktopTextZoom, opts.tabletTextZoom, opts.mobileTextZoom)
  const s: Record<string, string> = {}
  if (fontSize != null) s['font-size'] = result.fontSize
  if (lineHeight != null) s['line-height'] = result.lineHeight
  return s
}

const fontFamilyStr = (font: { family: string; weight: number; italic?: boolean } | undefined) => {
  if (!font?.family) return {}
  const s: Record<string, string> = { 'font-family': `"${font.family}"`, 'font-weight': String(font.weight) }
  if (font.italic) s['font-style'] = 'italic'
  return s
}

const level1Style = computed(() => ({
  ...fontFamilyStr(props.block.menuFont),
  ...computeFontStyle(props.block.menuFontSize, props.block.menuLineHeight),
  color: colors.value?.color
}))

const subLevelStyle = computed(() => ({
  ...fontFamilyStr(props.block.menuSubFont),
  ...computeFontStyle(props.block.menuSubFontSize, props.block.menuSubLineHeight),
  color: colors.value?.color
}))

const cssVars = computed(() => {
  if (!colors.value) return {}
  return {
    '--menu-color': colors.value.color,
    '--menu-hover': colors.value.hover,
    '--menu-active': colors.value.active
  }
})

const navigate = (item: MenuItem) => {
  if ((event?.target as HTMLElement)?.closest('.blockui')) return
  const link = item.link
  if (!link?.url) return
  if (link.type === 'external') {
    window.open(link.url, '_blank', 'noopener,noreferrer')
    return
  }
  if (link.type === 'internal') {
    router.push(link.url)
  }
}
</script>

<template>
  <div ref="blockRef" class="block menu-block" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <nav class="menu-block__nav" :style="cssVars">
      <ul class="menu-block__list">
        <li
          v-for="(item, idx) in block.menu"
          :key="idx"
          class="menu-block__item"
          :class="{ 'menu-block__item--has-children': item.children?.length }"
        >
          <a
            v-if="item.link?.url"
            class="menu-block__link"
            :style="level1Style"
            :href="item.link.type === 'external' ? item.link.url : undefined"
            :target="item.link.type === 'external' ? '_blank' : undefined"
            :rel="item.link.type === 'external' ? 'noopener noreferrer' : undefined"
            @click.prevent="navigate(item)"
          >
            {{ item.locales?.label }}
          </a>
          <span v-else class="menu-block__link" :style="level1Style">{{ item.locales?.label }}</span>
          <ul v-if="item.children?.length" class="menu-block__submenu">
            <li v-for="(child, cIdx) in item.children" :key="cIdx" class="menu-block__subitem">
              <a
                v-if="child.link?.url"
                class="menu-block__sublink"
                :style="subLevelStyle"
                :href="child.link.type === 'external' ? child.link.url : undefined"
                :target="child.link.type === 'external' ? '_blank' : undefined"
                :rel="child.link.type === 'external' ? 'noopener noreferrer' : undefined"
                @click.prevent="navigate(child)"
              >
                {{ child.locales?.label }}
              </a>
              <span v-else class="menu-block__sublink" :style="subLevelStyle">{{ child.locales?.label }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <div class="blockui resize"></div>
  </div>
</template>

<style scoped>
.menu-block {
  display: flex;
  align-items: center;
}

.menu-block__nav {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.menu-block__list {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.menu-block__item {
  position: relative;
  white-space: nowrap;
}

.menu-block__link {
  color: var(--menu-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.menu-block__link:hover {
  color: var(--menu-hover) !important;
}

.menu-block__link:active {
  color: var(--menu-active) !important;
}

.menu-block__submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  background: var(--menu-bg, #fff);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.menu-block__item--has-children:hover > .menu-block__submenu {
  display: block;
}

.menu-block__sublink {
  display: block;
  padding: 0.35rem 1rem;
  color: var(--menu-color);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
  white-space: nowrap;
}

.menu-block__sublink:hover {
  color: var(--menu-hover) !important;
}

.menu-block__sublink:active {
  color: var(--menu-active) !important;
}
</style>
