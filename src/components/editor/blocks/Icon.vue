<script lang="ts" setup>
import {
  IconHomeFilled,
  IconDog,
  IconFish,
  IconCat,
  IconArrowBackUp,
  IconArrowBack,
  IconArrowBigDownFilled,
  IconArrowBigLeftFilled,
  IconArrowBigRightFilled,
  IconArrowBigUpFilled,
  IconArrowNarrowDown,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconArrowNarrowUp,
  IconCaretDownFilled,
  IconCaretLeftFilled,
  IconCaretRightFilled,
  IconCaretUpFilled,
  IconCaretUpDownFilled,
  IconSquareArrowDownFilled,
  IconSquareArrowLeftFilled,
  IconSquareArrowRightFilled,
  IconSquareArrowUpFilled,
  IconSquareChevronDownFilled,
  IconSquareChevronLeftFilled,
  IconSquareChevronRightFilled,
  IconSquareChevronUpFilled,
  IconAwardFilled,
  IconHome2Filled,
  IconChartArcs3,
  IconChartBarPopular,
  IconChartBar,
  IconChartDonutFilled,
  IconChartLine,
  IconChartPieFilled,
  IconMailFilled,
  IconMailOpenedFilled,
  IconCloudDataConnectionFilled,
  IconCurrencyDollar,
  IconCurrencyEuro,
  IconCurrencyPound,
  IconDatabaseFilled,
  IconDatabasePlus,
  IconBlur,
  IconBlurOff,
  IconBlendMode,
  IconBoltFilled,
  IconBoltOff,
  IconBoxMultipleFilled,
  IconBriefcaseFilled,
  IconBorderCornerPill,
  IconBorderCornerRounded,
  IconGrid3x3,
  IconGrid4x4,
  IconRadiusBottomLeft,
  IconRadiusBottomRight,
  IconRadiusTopLeft,
  IconRadiusTopRight,
  IconSquareHalf,
  IconKeyFilled,
  IconDeviceDesktopFilled,
  IconDeviceImacFilled,
  IconDeviceIpadFilled,
  IconDeviceMobileFilled
} from '@tabler/icons-vue'
import type { Component } from 'vue'

const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, textStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const { hasLink, onBlockClick } = useBlockLink(() => props.block)
const st = siteStore()

const iconMap: Record<string, Component> = {
  IconDog, IconFish, IconCat, IconArrowBackUp, IconArrowBack,
  IconArrowBigDownFilled, IconArrowBigLeftFilled, IconArrowBigRightFilled, IconArrowBigUpFilled,
  IconArrowNarrowDown, IconArrowNarrowLeft, IconArrowNarrowRight, IconArrowNarrowUp,
  IconCaretDownFilled, IconCaretLeftFilled, IconCaretRightFilled, IconCaretUpFilled, IconCaretUpDownFilled,
  IconSquareArrowDownFilled, IconSquareArrowLeftFilled, IconSquareArrowRightFilled, IconSquareArrowUpFilled,
  IconSquareChevronDownFilled, IconSquareChevronLeftFilled, IconSquareChevronRightFilled, IconSquareChevronUpFilled,
  IconAwardFilled, IconHome2Filled, IconHomeFilled,
  IconChartArcs3, IconChartBarPopular, IconChartBar, IconChartDonutFilled, IconChartLine, IconChartPieFilled,
  IconMailFilled, IconMailOpenedFilled,
  IconCloudDataConnectionFilled,
  IconCurrencyDollar, IconCurrencyEuro, IconCurrencyPound,
  IconDatabaseFilled, IconDatabasePlus,
  IconBlur, IconBlurOff, IconBlendMode,
  IconBoltFilled, IconBoltOff,
  IconBoxMultipleFilled, IconBriefcaseFilled,
  IconBorderCornerPill, IconBorderCornerRounded,
  IconGrid3x3, IconGrid4x4,
  IconRadiusBottomLeft, IconRadiusBottomRight, IconRadiusTopLeft, IconRadiusTopRight,
  IconSquareHalf,
  IconKeyFilled,
  IconDeviceDesktopFilled, IconDeviceImacFilled, IconDeviceIpadFilled, IconDeviceMobileFilled
}

const isDark = computed(() => !!st.site?.options.darkMode)

const iconName = computed(() => props.block.icon?.name || 'IconHomeFilled')
const iconComponent = computed(() => iconMap[iconName.value] || IconHomeFilled)

const sectionTargetWidth = computed(() => props.section.style.maxWidth ?? st.site?.options.desktopWidth)
const { computedStyles: sectionFont } = useFontSize(() => sectionTargetWidth.value, () => props.section.style.fullWidth)

const iconSize = computed(() => {
  const fs = textStyle.value?.['font-size'] ?? sectionFont.value?.fontSize
  if (fs) {
    if (fs.endsWith('px')) return parseFloat(fs)
    if (fs.endsWith('em')) return Math.round(parseFloat(fs) * 24)
    return parseFloat(fs) || 24
  }
  return 24
})

const iconColor = computed(() => {
  if (textStyle.value?.['color']) return textStyle.value['color']
  const opts = st.site?.options
  return isDark.value ? opts?.darkColor : opts?.lightColor
})

const strokeWidth = computed(() => props.block.icon?.strokeWidth ?? 1)

const onClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.blockui')) return
  onBlockClick()
}
</script>

<template>
  <div
    ref="blockRef"
    class="block icon-block"
    :class="{ 'block-link': hasLink }"
    :style="blockStyle"
    @contextmenu="onContextMenu"
    @click="onClick"
  >
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <div class="icon-block__inner" :style="{ color: iconColor }">
      <component :is="iconComponent" :size="iconSize" :stroke-width="strokeWidth" />
    </div>
    <div class="blockui resize"></div>
  </div>
</template>

<style scoped>
.icon-block {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-block__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
