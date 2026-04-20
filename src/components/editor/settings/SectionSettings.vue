<script setup lang="ts">
import { IconDeviceMobile, IconDeviceTablet, IconDeviceDesktop, IconEye, IconEyeOff } from '@tabler/icons-vue'

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

const keys: { key: keyof BreakpointSize; label: string; min: number; max: number }[] = [
  { key: 'cols', label: t('grid.cols'), min: 1, max: 48 },
  { key: 'rows', label: t('grid.rows'), min: 0, max: 100 },
  { key: 'gap', label: t('grid.gap'), min: 0, max: 40 }
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
    <!-- <MediaManager /> -->
    <div class="mt-4"></div>
    <!-- {{ activeSection }} -->

    <div class="mb-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <label class="small fw-semibold mb-0">Full width</label>
        <CFormSwitch :checked="isFullWidth" @change="isFullWidth = !isFullWidth" />
      </div>
    </div>
    <div v-if="!isFullWidth" class="mb-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <label class="small fw-semibold mb-0">Section max width</label>
        <CFormSwitch :checked="hasMaxWidth" @change="hasMaxWidth = !hasMaxWidth" />
      </div>
      <SectionRange
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
      <label class="small fw-semibold d-block mb-2">{{ t('section.hideOn') }}</label>
      <div class="d-flex gap-2">
        <button
          v-for="m in modes"
          :key="m.key"
          class="btn btn-sm"
          :class="isHidden(m.key) ? 'btn-outline-warning' : 'btn-outline-secondary'"
          @click="toggleHideOn(m.key)"
          :title="isHidden(m.key) ? t('section.hidden', { mode: m.label }) : t('section.visible', { mode: m.label })"
        >
          <component :is="isHidden(m.key) ? IconEyeOff : IconEye" :size="16" class="me-1" />
          <span class="small">{{ m.label }}</span>
        </button>
      </div>
    </div>
    <div v-for="m in modes" :key="m.key" class="mb-4">
      <div class="d-flex align-items-center gap-1 mb-2">
        <component :is="m.icon" :size="16" />
        <span class="fw-semibold small">{{ m.label }}</span>
      </div>
      <div v-for="k in keys" :key="k.key" class="d-flex align-items-center gap-2 mb-1">
        <label class="small text-secondary mb-0" style="min-width: 2.5rem">{{ k.label }}</label>
        <input
          type="number"
          class="form-control form-control-sm"
          style="width: 4.5rem"
          :value="getField(m.key, k.key).value"
          :min="k.min"
          :max="k.max"
          @input="getField(m.key, k.key).value = Number(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </COffcanvasBody>
</template>
