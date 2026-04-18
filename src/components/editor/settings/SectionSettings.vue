<script setup lang="ts">
import { IconDeviceMobile, IconDeviceTablet, IconDeviceDesktop } from '@tabler/icons-vue'

const stt = settingsStore()
const pg = pageStore()
const { activeSection } = storeToRefs(pg)
const { showsettings } = storeToRefs(stt)
const hs = historyStore()
const { t } = useI18n()

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
    {{ activeSection }}
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
