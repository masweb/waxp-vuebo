<script setup lang="ts">
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceDesktop,
  IconEyeFilled,
  IconEyeOff,
  IconLayoutColumns,
  IconLayoutRows,
  IconBoxMargin
} from '@tabler/icons-vue'

const stt = settingsStore()
const pg = pageStore()
const st = siteStore()
const { activeSection } = storeToRefs(pg)
const { showsettings } = storeToRefs(stt)
const { site } = storeToRefs(st)
const hs = historyStore()
const { t } = useI18n()

const isFullWidth = computed({
  get: () => activeSection.value?.style.fullWidth ?? false,
  set: (v: boolean) => {
    if (!activeSection.value) return
    hs.snapshot()
    activeSection.value.style.fullWidth = v
    if (v) activeSection.value.style.maxWidth = null
  }
})

const hasMaxWidth = computed({
  get: () => !isFullWidth.value && activeSection.value?.style.maxWidth !== null,
  set: (v: boolean) => {
    if (!activeSection.value) return
    hs.snapshot()
    activeSection.value.style.maxWidth = v ? (site.value?.options.desktopWidth ?? 1200) : null
  }
})

const modes: { key: ViewportMode; label: string; icon: any }[] = [
  { key: 'desktop', label: t('viewport.desktop'), icon: IconDeviceDesktop },
  { key: 'tablet', label: t('viewport.tablet'), icon: IconDeviceTablet },
  { key: 'mobile', label: t('viewport.mobile'), icon: IconDeviceMobile }
]

const keys: { key: keyof BreakpointSize; icon: any; min: number; max: number }[] = [
  { key: 'cols', icon: IconLayoutColumns, min: 1, max: 48 },
  { key: 'rows', icon: IconLayoutRows, min: 0, max: 100 },
  { key: 'gap', icon: IconBoxMargin, min: 0, max: 40 }
]

const isHidden = (mode: ViewportMode) => activeSection.value?.style.hideOn?.includes(mode) ?? false

const toggleHideOn = (mode: ViewportMode) => {
  if (!activeSection.value) return
  hs.snapshot()
  const arr = activeSection.value.style.hideOn ?? []
  const idx = arr.indexOf(mode)
  if (idx === -1 && arr.length < 2) {
    arr.push(mode)
  } else if (idx !== -1) {
    arr.splice(idx, 1)
  }
  activeSection.value.style.hideOn = arr
}

const onBackgroundUpdate = (bg: Background) => {
  if (!activeSection.value) return
  hs.snapshot()
  activeSection.value.style.background = bg
}

const onSectionBackgroundUpdate = (bg: Background) => {
  if (!activeSection.value) return
  hs.snapshot()
  activeSection.value.style.section_background = bg
}

const onPaddingUpdate = (sides: Sides) => {
  if (!activeSection.value) return
  hs.snapshot()
  activeSection.value.style.padding = sides
}

const onMarginUpdate = (sides: Sides) => {
  if (!activeSection.value) return
  hs.snapshot()
  activeSection.value.style.margin = sides
}

const fieldMap = reactive(new Map<string, any>())

const getField = (mode: ViewportMode, key: keyof BreakpointSize) => {
  const id = `${mode}_${key}`
  let c = fieldMap.get(id)
  if (!c) {
    c = computed({
      get: () => (activeSection.value?.[mode] as BreakpointSize)?.[key] ?? 0,
      set: (v: number) => {
        if (activeSection.value) {
          hs.snapshot()
          ;(activeSection.value[mode] as BreakpointSize)[key] = v
        }
      }
    })
    fieldMap.set(id, c)
  }
  return c
}
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>{{ t('section.options') }}</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody v-if="activeSection">
    <div class="mt-4"></div>
    <div v-if="!isFullWidth" class="mb-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <label class="small mb-0">Section max width</label>
        <CFormSwitch :checked="hasMaxWidth" @change="hasMaxWidth = !hasMaxWidth" />
      </div>
      <NumberRange
        v-if="hasMaxWidth"
        :modelValue="activeSection?.style.maxWidth ?? site?.options.desktopWidth ?? 1200"
        :min="site?.options.tabletBP ?? 767"
        :max="2000"
        @update:modelValue="
          (v: number) => {
            if (activeSection) {
              hs.snapshot()
              activeSection.style.maxWidth = v
            }
          }
        "
      />
    </div>
    <div class="mb-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <label class="small mb-0">Full width</label>
        <CFormSwitch :checked="isFullWidth" @change="isFullWidth = !isFullWidth" />
      </div>
    </div>

    <SidesField
      :modelValue="activeSection.style.padding"
      :label="t('section.padding')"
      @update:modelValue="onPaddingUpdate"
    />
    <SidesField
      :modelValue="activeSection.style.margin"
      :label="t('section.margin')"
      @update:modelValue="onMarginUpdate"
    />
    <BackgroundSettings :background="activeSection.style.background" @update="onBackgroundUpdate" />

    <div v-if="!isFullWidth" class="mb-3">
      <label class="small d-block mb-2">{{ t('section.rowBackground') }}</label>
      <BackgroundSettings
        :background="activeSection.style.section_background ?? { mode: 'none' }"
        @update="onSectionBackgroundUpdate"
      />
    </div>
    <div class="mb-3">
      <label class="small d-block mb-2">{{ t('section.hideOn') }}</label>
      <div class="d-flex btn-group">
        <button
          v-for="m in modes"
          :key="m.key"
          class="btn btn-sm"
          :class="isHidden(m.key) ? 'btn-primary' : 'btn-outline-secondary'"
          @click="toggleHideOn(m.key)"
          :title="isHidden(m.key) ? t('section.hidden', { mode: m.label }) : t('section.visible', { mode: m.label })"
        >
          <component :is="isHidden(m.key) ? IconEyeOff : IconEyeFilled" :size="18" stroke-width="1" class="me-1" />
          <span class="small">{{ m.label }}</span>
        </button>
      </div>
    </div>
    <table class="table table-sm table-borderless mb-0 align-middle" style="table-layout: fixed">
      <thead>
        <tr>
          <th style="width: 2rem"></th>
          <th v-for="m in modes" :key="m.key" class="text-center px-1">
            <component :is="m.icon" :size="16" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="k in keys" :key="k.key">
          <td class="text-center">
            <component :is="k.icon" :size="16" />
          </td>
          <td v-for="m in modes" :key="m.key" class="px-1">
            <input
              type="number"
              class="form-control form-control-sm text-center"
              :value="getField(m.key, k.key).value"
              :min="k.min"
              :max="k.max"
              @input="getField(m.key, k.key).value = Number(($event.target as HTMLInputElement).value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </COffcanvasBody>
</template>
