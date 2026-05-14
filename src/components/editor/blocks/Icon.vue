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
  IconDeviceMobileFilled,
  IconBrandGithubFilled
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

const sectionTargetWidth = computed(() => props.section.style.maxWidth ?? st.site?.options.desktopWidth)
const { computedStyles: sectionFont } = useFontSize(() => sectionTargetWidth.value, () => props.section.style.fullWidth)

const iconMap: Record<string, Component> = {
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
  IconHomeFilled,
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
  IconDeviceMobileFilled,
  IconBrandGithubFilled
}

const isDark = computed(() => !!st.site?.options.darkMode)

const iconName = computed(() => props.block.icon?.name || 'IconHomeFilled')
const iconComponent = computed(() => iconMap[iconName.value] || IconHomeFilled)

const iconStyle = computed(() => {
  const s: Record<string, string> = {}
  if (textStyle.value?.['font-size']) {
    s['font-size'] = textStyle.value['font-size']
  } else if (sectionFont.value) {
    s['font-size'] = sectionFont.value.fontSize
  }
  if (textStyle.value?.['color']) {
    s['color'] = textStyle.value['color']
  } else {
    const opts = st.site?.options
    s['color'] = isDark.value ? (opts?.darkColor ?? '') : (opts?.lightColor ?? '')
  }
  return s
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
    <div class="icon-block__inner" :style="iconStyle">
      <component :is="iconComponent" :size="'1em'" :stroke-width="strokeWidth" class="icon-block__svg" />
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
