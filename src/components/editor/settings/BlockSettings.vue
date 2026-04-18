<script setup lang="ts">
import { IconDeviceMobile, IconDeviceTablet, IconDeviceDesktop } from '@tabler/icons-vue'

const stt = settingsStore()
const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const { showsettings } = storeToRefs(stt)
const hs = historyStore()

const modes: { key: ViewportMode; label: string; icon: any }[] = [
  { key: 'desktop', label: 'Desktop', icon: IconDeviceDesktop },
  { key: 'tablet', label: 'Tablet', icon: IconDeviceTablet },
  { key: 'mobile', label: 'Mobile', icon: IconDeviceMobile }
]

const coordsKeys: { key: keyof BlockCoords; label: string; min: number }[] = [
  { key: 'x', label: 'X', min: 1 },
  { key: 'y', label: 'Y', min: 1 },
  { key: 'w', label: 'W', min: 1 },
  { key: 'h', label: 'H', min: 1 }
]

const fieldMap = reactive(new Map<string, any>())

const getField = (mode: ViewportMode, key: keyof BlockCoords) => {
  const id = `${mode}_${key}`
  let c = fieldMap.get(id)
  if (!c) {
    c = computed({
      get: () => {
        const modeKey = MODE_KEY[mode] as keyof Block
        return (activeBlock.value?.[modeKey] as BlockCoords)?.[key] ?? 0
      },
      set: (v: number) => {
        if (activeBlock.value) {
          hs.snapshot()
          const modeKey = MODE_KEY[mode] as keyof Block
          ;(activeBlock.value[modeKey] as BlockCoords)[key] = v
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
    <COffcanvasTitle>Opciones de bloque</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody v-if="activeBlock">
    {{ activeBlock }}
    <div class="mb-3">
      <label class="small text-secondary">Tipo</label>
      <div class="fw-semibold">{{ activeBlock.type }}</div>
    </div>
    <div v-for="m in modes" :key="m.key" class="mb-4">
      <div class="d-flex align-items-center gap-1 mb-2">
        <component :is="m.icon" :size="16" />
        <span class="fw-semibold small">{{ m.label }}</span>
      </div>
      <div v-for="k in coordsKeys" :key="k.key" class="d-flex align-items-center gap-2 mb-1">
        <label class="small text-secondary mb-0" style="min-width: 2.5rem">{{ k.label }}</label>
        <input
          type="number"
          class="form-control form-control-sm"
          style="width: 4.5rem"
          :value="getField(m.key, k.key).value"
          :min="k.min"
          @input="getField(m.key, k.key).value = Number(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </COffcanvasBody>
</template>
