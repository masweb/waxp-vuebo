<script lang="ts" setup>
import type { Font, HeadersConfig } from '@/types/defaultOptions'
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceDesktop,
  IconArrowsHorizontal,
  IconBorderLeft,
  IconZoomIn
} from '@tabler/icons-vue'
import FontFamilyField from './fields/FontFamilyField.vue'
import HeaderSettings from './HeaderSettings.vue'

const stt = settingsStore()
const { showsettings } = storeToRefs(stt)
const st = siteStore()
const { site } = storeToRefs(st)
const hs = historyStore()
const { t } = useI18n()

const activeTab = ref('general')

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

const headers = computed<HeadersConfig>({
  get: () => site.value?.options?.headers ?? {} as HeadersConfig,
  set: (v: HeadersConfig) => {
    if (!site.value?.options) return
    hs.snapshot()
    site.value.options.headers = v
  }
})
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>{{ t('siteSettings.title') }}</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody>
    <ul class="nav nav-tabs mt-3">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">{{ t('siteSettings.tabs.general') }}</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'typography' }" @click="activeTab = 'typography'">{{ t('siteSettings.tabs.typography') }}</button>
      </li>
    </ul>

    <div v-if="activeTab === 'general'" class="mt-3">
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
      <ColorPicker
        :label="t('siteSettings.accentLight')"
        :color="site?.options.lightAccentColor"
        @update:color="updateColor('lightAccentColor', $event)"
      />
      <ColorPicker
        :label="t('siteSettings.accentDark')"
        :color="site?.options.darkAccentColor"
        @update:color="updateColor('darkAccentColor', $event)"
      />

      <table class="table table-sm table-borderless mt-3 mb-0 align-middle" style="table-layout: fixed">
        <thead>
          <tr>
            <th style="width: 2rem"></th>
            <th class="text-center px-1"><IconDeviceDesktop :size="16" :title="t('viewport.desktop')" /></th>
            <th class="text-center px-1"><IconDeviceTablet :size="16" :title="t('viewport.tablet')" /></th>
            <th class="text-center px-1"><IconDeviceMobile :size="16" :title="t('viewport.mobile')" /></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center"><IconArrowsHorizontal :size="16" :title="t('siteSettings.width')" /></td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.desktopWidth ?? 1200"
                :min="site?.options.tabletBP ?? 767"
                max="2000"
                @input="updateOption('desktopWidth', +($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.tabletBP ?? 1024"
                :min="site?.options.mobileBP ?? 767"
                :max="site?.options.desktopWidth ?? 1200"
                @input="updateOption('tabletBP', +($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.mobileBP ?? 767"
                min="320"
                :max="site?.options.tabletBP ?? 1024"
                @input="updateOption('mobileBP', +($event.target as HTMLInputElement).value)"
              />
            </td>
          </tr>
          <tr>
            <td class="text-center"><IconBorderLeft :size="16" :title="t('siteSettings.margin')" /></td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.desktopMargin ?? 10"
                min="0"
                max="100"
                @input="updateOption('desktopMargin', +($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.tabletMargin ?? 10"
                min="0"
                max="100"
                @input="updateOption('tabletMargin', +($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.mobileMargin ?? 10"
                min="0"
                max="100"
                @input="updateOption('mobileMargin', +($event.target as HTMLInputElement).value)"
              />
            </td>
          </tr>
          <tr>
            <td class="text-center"><IconZoomIn :size="16" :title="t('siteSettings.textZoom')" /></td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.desktopTextZoom ?? 1"
                min="0"
                max="2000"
                step="0.1"
                @input="updateOption('desktopTextZoom', +($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.tabletTextZoom ?? 1"
                min="0"
                max="2000"
                step="0.1"
                @input="updateOption('tabletTextZoom', +($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="px-1">
              <input
                type="number"
                class="form-control form-control-sm text-center"
                :value="site?.options.mobileTextZoom ?? 1"
                min="0"
                max="5"
                step="0.1"
                @input="updateOption('mobileTextZoom', +($event.target as HTMLInputElement).value)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'typography'" class="mt-3">
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
      <HeaderSettings v-model="headers" />
      <FontManager class="mt-4" />
    </div>
  </COffcanvasBody>
</template>
