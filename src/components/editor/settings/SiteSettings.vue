<script lang="ts" setup>
import type { Font } from '@/types/defaultOptions'
import FontFamilyField from './fields/FontFamilyField.vue'

const stt = settingsStore()
const { showsettings } = storeToRefs(stt)
const st = siteStore()
const { site } = storeToRefs(st)
const hs = historyStore()
const { t } = useI18n()

const updateColor = (key: string, value: string) => {
  if (!site.value?.options) return
  hs.snapshot()
  ;(site.value.options as any)[key] = value
}

const updateOption = (key: string, value: number) => {
  if (!site.value?.options) return
  hs.snapshot()
  ;(site.value.options as any)[key] = value
}

const globalFont = computed<Font>({
  get: () => site.value?.options?.globalFontFamily ?? { family: '', weight: 400, italic: false },
  set: (v: Font) => {
    if (!site.value?.options) return
    hs.snapshot()
    site.value.options.globalFontFamily = v
  }
})
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>{{ t('siteSettings.title') }}</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody>
    <div class="mt-3">
      <FontFamilyField v-model="globalFont" :label="t('fonts.globalFont')" />
      <NumberRange
        class="mt-2"
        :modelValue="site?.options.fontSize ?? 1"
        :label="t('block.fontSize')"
        :min="0.1"
        :max="2"
        :step="0.01"
        @update:modelValue="updateOption('fontSize', $event)"
      />
      <NumberRange
        class="mt-2"
        :modelValue="site?.options.lineHeight ?? 1.4"
        :label="t('block.lineHeight')"
        :min="0.1"
        :max="3"
        :step="0.01"
        @update:modelValue="updateOption('lineHeight', $event)"
      />
    </div>
    <ColorPicker
      :label="t('siteSettings.colorLight')"
      :color="site?.options.lightColor"
      @update:color="updateColor('lightColor', $event)"
    />
    <ColorPicker
      :label="t('siteSettings.backgroundLight')"
      :color="site?.options.lightBackColor"
      @update:color="updateColor('lightBackColor', $event)"
    />
    <ColorPicker
      :label="t('siteSettings.colorDark')"
      :color="site?.options.darkColor"
      @update:color="updateColor('darkColor', $event)"
    />
    <ColorPicker
      :label="t('siteSettings.backgroundDark')"
      :color="site?.options.darkBackColor"
      @update:color="updateColor('darkBackColor', $event)"
    />

    <NumberRange
      class="mt-3"
      :modelValue="site?.options.desktopWidth ?? 1200"
      :label="t('siteSettings.desktopWidth')"
      :min="site?.options.tabletBP ?? 767"
      :max="2000"
      @update:modelValue="updateOption('desktopWidth', $event)"
    />
    <NumberRange
      class="mt-3"
      :modelValue="site?.options.desktopTextZoom ?? 1"
      :label="t('siteSettings.desktopTextZoom')"
      :min="0"
      :max="2000"
      @update:modelValue="updateOption('desktopTextZoom', $event)"
    />
    <NumberRange
      :modelValue="site?.options.tabletBP ?? 1024"
      :label="t('siteSettings.tabletBreakpoint')"
      :min="site?.options.mobileBP ?? 767"
      :max="site?.options.desktopWidth ?? 1200"
      @update:modelValue="updateOption('tabletBP', $event)"
    />
    <NumberRange
      class="mt-3"
      :modelValue="site?.options.tabletTextZoom ?? 1"
      :label="t('siteSettings.tabletTextZoom')"
      :min="0"
      :steep="0.1"
      :max="2000"
      @update:modelValue="updateOption('tabletTextZoom', $event)"
    />
    <NumberRange
      :modelValue="site?.options.mobileBP ?? 767"
      :label="t('siteSettings.mobileBreakpoint')"
      :min="320"
      :max="site?.options.tabletBP ?? 1024"
      @update:modelValue="updateOption('mobileBP', $event)"
    />

    <FontManager class="mt-4" />
  </COffcanvasBody>
</template>
