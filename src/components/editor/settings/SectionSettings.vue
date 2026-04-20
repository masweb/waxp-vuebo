<script setup lang="ts">
import { IconDeviceMobile, IconDeviceTablet, IconDeviceDesktop } from '@tabler/icons-vue'

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
