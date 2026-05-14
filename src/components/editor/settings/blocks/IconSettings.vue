<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
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
import ColorPicker from '../fields/ColorPicker.vue'
import NumberRange from '../fields/NumberRange.vue'

const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const hs = historyStore()
const { t } = useI18n()
const st = siteStore()

const iconList: { name: string; component: Component }[] = [
  { name: 'IconHomeFilled', component: IconHomeFilled },
  { name: 'IconHome2Filled', component: IconHome2Filled },
  { name: 'IconDog', component: IconDog },
  { name: 'IconFish', component: IconFish },
  { name: 'IconCat', component: IconCat },
  { name: 'IconArrowBackUp', component: IconArrowBackUp },
  { name: 'IconArrowBack', component: IconArrowBack },
  { name: 'IconArrowBigDownFilled', component: IconArrowBigDownFilled },
  { name: 'IconArrowBigLeftFilled', component: IconArrowBigLeftFilled },
  { name: 'IconArrowBigRightFilled', component: IconArrowBigRightFilled },
  { name: 'IconArrowBigUpFilled', component: IconArrowBigUpFilled },
  { name: 'IconArrowNarrowDown', component: IconArrowNarrowDown },
  { name: 'IconArrowNarrowLeft', component: IconArrowNarrowLeft },
  { name: 'IconArrowNarrowRight', component: IconArrowNarrowRight },
  { name: 'IconArrowNarrowUp', component: IconArrowNarrowUp },
  { name: 'IconCaretDownFilled', component: IconCaretDownFilled },
  { name: 'IconCaretLeftFilled', component: IconCaretLeftFilled },
  { name: 'IconCaretRightFilled', component: IconCaretRightFilled },
  { name: 'IconCaretUpFilled', component: IconCaretUpFilled },
  { name: 'IconCaretUpDownFilled', component: IconCaretUpDownFilled },
  { name: 'IconSquareArrowDownFilled', component: IconSquareArrowDownFilled },
  { name: 'IconSquareArrowLeftFilled', component: IconSquareArrowLeftFilled },
  { name: 'IconSquareArrowRightFilled', component: IconSquareArrowRightFilled },
  { name: 'IconSquareArrowUpFilled', component: IconSquareArrowUpFilled },
  { name: 'IconSquareChevronDownFilled', component: IconSquareChevronDownFilled },
  { name: 'IconSquareChevronLeftFilled', component: IconSquareChevronLeftFilled },
  { name: 'IconSquareChevronRightFilled', component: IconSquareChevronRightFilled },
  { name: 'IconSquareChevronUpFilled', component: IconSquareChevronUpFilled },
  { name: 'IconAwardFilled', component: IconAwardFilled },
  { name: 'IconChartArcs3', component: IconChartArcs3 },
  { name: 'IconChartBarPopular', component: IconChartBarPopular },
  { name: 'IconChartBar', component: IconChartBar },
  { name: 'IconChartDonutFilled', component: IconChartDonutFilled },
  { name: 'IconChartLine', component: IconChartLine },
  { name: 'IconChartPieFilled', component: IconChartPieFilled },
  { name: 'IconMailFilled', component: IconMailFilled },
  { name: 'IconMailOpenedFilled', component: IconMailOpenedFilled },
  { name: 'IconCloudDataConnectionFilled', component: IconCloudDataConnectionFilled },
  { name: 'IconCurrencyDollar', component: IconCurrencyDollar },
  { name: 'IconCurrencyEuro', component: IconCurrencyEuro },
  { name: 'IconCurrencyPound', component: IconCurrencyPound },
  { name: 'IconDatabaseFilled', component: IconDatabaseFilled },
  { name: 'IconDatabasePlus', component: IconDatabasePlus },
  { name: 'IconBlur', component: IconBlur },
  { name: 'IconBlurOff', component: IconBlurOff },
  { name: 'IconBlendMode', component: IconBlendMode },
  { name: 'IconBoltFilled', component: IconBoltFilled },
  { name: 'IconBoltOff', component: IconBoltOff },
  { name: 'IconBoxMultipleFilled', component: IconBoxMultipleFilled },
  { name: 'IconBriefcaseFilled', component: IconBriefcaseFilled },
  { name: 'IconBorderCornerPill', component: IconBorderCornerPill },
  { name: 'IconBorderCornerRounded', component: IconBorderCornerRounded },
  { name: 'IconGrid3x3', component: IconGrid3x3 },
  { name: 'IconGrid4x4', component: IconGrid4x4 },
  { name: 'IconRadiusBottomLeft', component: IconRadiusBottomLeft },
  { name: 'IconRadiusBottomRight', component: IconRadiusBottomRight },
  { name: 'IconRadiusTopLeft', component: IconRadiusTopLeft },
  { name: 'IconRadiusTopRight', component: IconRadiusTopRight },
  { name: 'IconSquareHalf', component: IconSquareHalf },
  { name: 'IconKeyFilled', component: IconKeyFilled },
  { name: 'IconDeviceDesktopFilled', component: IconDeviceDesktopFilled },
  { name: 'IconDeviceImacFilled', component: IconDeviceImacFilled },
  { name: 'IconDeviceIpadFilled', component: IconDeviceIpadFilled },
  { name: 'IconDeviceMobileFilled', component: IconDeviceMobileFilled },
  { name: 'IconBrandGithubFilled', component: IconBrandGithubFilled }
]

const ensureIcon = () => {
  if (!activeBlock.value) return
  if (!activeBlock.value.icon) {
    activeBlock.value.icon = { name: 'IconHomeFilled', strokeWidth: 1 }
  }
}

const selectIcon = (name: string) => {
  if (!activeBlock.value) return
  hs.snapshot()
  ensureIcon()
  activeBlock.value.icon!.name = name
}

const selectedName = computed(() => activeBlock.value?.icon?.name ?? 'IconHomeFilled')

const strokeWidth = computed({
  get: () => activeBlock.value?.icon?.strokeWidth ?? 1,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    ensureIcon()
    activeBlock.value.icon!.strokeWidth = v
  }
})

const onColorLightUpdate = (color: string) => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.color = color || null
}

const onColorDarkUpdate = (color: string) => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.darkColor = color || null
}

const hasFontSize = computed(() => activeBlock.value?.fontSize != null)

const fontSize = computed({
  get: () => activeBlock.value?.fontSize ?? st.site?.options.fontSize ?? 1,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.fontSize = v
  }
})

const resetFontSize = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.fontSize = null
}
</script>

<template>
  <hr class="my-3" />
  <div class="mb-3">
    <label class="form-label mb-2">{{ t('block.iconSelect') }}</label>
    <div class="icon-grid">
      <button
        v-for="ic in iconList"
        :key="ic.name"
        class="btn icon-grid__item"
        :class="{ 'icon-grid__item--active': selectedName === ic.name }"
        :title="ic.name"
        @click="selectIcon(ic.name)"
      >
        <component :is="ic.component" :size="24" stroke-width="1" />
      </button>
    </div>
  </div>
  <div class="mb-3">
    <div class="d-flex align-items-center justify-content-between mb-1">
      <label class="form-label mb-0">{{ t('block.iconStrokeWidth') }}</label>
    </div>
    <NumberRange v-model="strokeWidth" :min="0.5" :max="3" :step="0.25" />
  </div>
  <div class="mb-3">
    <ColorPicker :color="activeBlock?.color ?? ''" :label="t('block.colorLight')" @update:color="onColorLightUpdate" />
  </div>
  <div class="mb-3">
    <ColorPicker
      :color="activeBlock?.darkColor ?? ''"
      :label="t('block.colorDark')"
      @update:color="onColorDarkUpdate"
    />
  </div>
  <div class="mb-3">
    <div class="d-flex align-items-center justify-content-between mb-1">
      <label class="form-label mb-0">{{ t('block.fontSize') }}</label>
      <span v-if="!hasFontSize" class="badge text-bg-secondary">{{ t('block.inherited') }}</span>
      <button v-else class="btn btn-sm btn-link p-0 text-secondary" @click="resetFontSize">
        <IconX :size="14" />
      </button>
    </div>
    <NumberRange v-model="fontSize" :min="0.1" :max="5" :step="0.1" />
  </div>
</template>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid var(--cui-border-color);
  border-radius: 6px;
  padding: 6px;
}

.icon-grid__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}

.icon-grid__item:hover {
  background-color: var(--cui-tertiary-bg);
}

.icon-grid__item--active {
  border-color: var(--cui-primary);
  background-color: var(--cui-primary-bg-subtle);
}
</style>
