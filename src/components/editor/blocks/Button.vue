<script lang="ts" setup>
const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const { onBlockClick } = useBlockLink(() => props.block)
const st = siteStore()

const isDark = computed(() => !!st.site?.options.darkMode)

const label = computed(() => props.block.locales?.label || '')

const btnColors = computed(() => {
  const b = props.block.button
  if (!b) return null
  const mode = isDark.value ? 'dark' : 'light'
  return {
    bg: b.bg[mode],
    hover: b.hover[mode],
    active: b.active[mode],
    focus: b.focus[mode],
    text: b.textColor[mode],
    hoverText: b.hoverTextColor[mode],
    activeText: b.activeTextColor[mode]
  }
})

const btnStyle = computed(() => {
  const b = props.block.button
  if (!b || !btnColors.value) return {}
  const border = b.border
  const s: Record<string, string> = {
    backgroundColor: btnColors.value.bg,
    color: btnColors.value.text,
    width: `${b.width}%`,
    paddingTop: `${b.padding.t}px`,
    paddingRight: `${b.padding.r}px`,
    paddingBottom: `${b.padding.b}px`,
    paddingLeft: `${b.padding.l}px`,
    borderRadius: `${border.radius.tl}px ${border.radius.tr}px ${border.radius.br}px ${border.radius.bl}px`
  }
  return s
})

const borderColor = computed(() => {
  const b = props.block.button
  if (!b) return null
  const ab = b.border.allBorders
  if (!ab.active) return null
  const mode = isDark.value ? 'dark' : 'light'
  return { color: b.borderColor[mode], thick: ab.thick, mode: ab.mode }
})

const borderStyle = computed(() => {
  const bc = borderColor.value
  if (!bc) return {}
  return { border: `${bc.thick}px ${bc.mode} ${bc.color}` }
})

const onClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.blockui')) return
  onBlockClick()
}

const cssVars = computed(() => {
  if (!btnColors.value) return {}
  return {
    '--btn-hover-bg': btnColors.value.hover,
    '--btn-active-bg': btnColors.value.active,
    '--btn-hover-color': btnColors.value.hoverText,
    '--btn-active-color': btnColors.value.activeText,
    '--btn-focus-ring': `0 0 0 3px ${btnColors.value.focus}`
  }
})
</script>

<template>
  <div ref="blockRef" class="block button-block" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <div class="button-block__wrapper">
      <button
        class="button-block__btn"
        :style="{ ...btnStyle, ...borderStyle, ...cssVars, ...textStyle }"
        @click="onClick"
      >
        {{ label }}
      </button>
    </div>
    <div class="blockui resize"></div>
  </div>
</template>

<style scoped>
.button-block {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-block__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.button-block__btn {
  border: none;
  cursor: pointer;
  text-align: center;
  line-height: inherit;
  transition: background-color 0.15s ease;
}

.button-block__btn:hover {
  background-color: var(--btn-hover-bg) !important;
  color: var(--btn-hover-color) !important;
}

.button-block__btn:active {
  background-color: var(--btn-active-bg) !important;
  color: var(--btn-active-color) !important;
}

.button-block__btn:focus {
  box-shadow: var(--btn-focus-ring);
  outline: none;
}
</style>
