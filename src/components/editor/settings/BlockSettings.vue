<script setup lang="ts">
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceDesktop,
  IconArrowsHorizontal,
  IconArrowsVertical,
  IconLayoutColumns,
  IconLayoutRows
} from '@tabler/icons-vue'

const stt = settingsStore()
const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const { showsettings } = storeToRefs(stt)
const hs = historyStore()
const { t } = useI18n()

const settingsComponents: Record<string, Component> = {
  Text: defineAsyncComponent(() => import('./blocks/TextSettings.vue')),
  Image: defineAsyncComponent(() => import('./blocks/ImageSettings.vue')),
  Space: defineAsyncComponent(() => import('./blocks/SpaceSettings.vue')),
  DarkMode: defineAsyncComponent(() => import('./blocks/DarkModeSettings.vue')),
  Button: defineAsyncComponent(() => import('./blocks/ButtonSettings.vue')),
  Icon: defineAsyncComponent(() => import('./blocks/IconSettings.vue')),
  Menu: defineAsyncComponent(() => import('./blocks/MenuSettings.vue'))
}

const settingsComponent = computed(() => settingsComponents[activeBlock.value?.type ?? ''])

const bgAllowedModes = computed<Background['mode'][]>(() => {
  return ['none', 'color', 'gradient', 'image']
})

const onBackgroundUpdate = (bg: Background) => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.style.background = bg
}

const ensureSides = (block: Block, key: 'padding' | 'margin'): Sides => {
  if (!block.style[key]) block.style[key] = { t: '0', r: '0', b: '0', l: '0' }
  return block.style[key]
}

const onPaddingUpdate = (sides: Sides) => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.style.padding = sides
}

const onMarginUpdate = (sides: Sides) => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.style.margin = sides
}

const modes: { key: ViewportMode; label: string; icon: any }[] = [
  { key: 'desktop', label: t('viewport.desktop'), icon: IconDeviceDesktop },
  { key: 'tablet', label: t('viewport.tablet'), icon: IconDeviceTablet },
  { key: 'mobile', label: t('viewport.mobile'), icon: IconDeviceMobile }
]

const coordsKeys: { key: keyof BlockCoords; icon: any; min: number }[] = [
  { key: 'x', icon: IconArrowsHorizontal, min: 1 },
  { key: 'y', icon: IconArrowsVertical, min: 1 },
  { key: 'w', icon: IconLayoutColumns, min: 1 },
  { key: 'h', icon: IconLayoutRows, min: 1 }
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
    <COffcanvasTitle>{{ t('block.options') }}</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody v-if="activeBlock">
    <div class="mb-3">
      <label class="small text-secondary">{{ t('block.type') }}</label>
      <div class="fw-semibold">{{ activeBlock.type }} <small class="text-secondary">#{{ activeBlock.id }}</small></div>
    </div>

    <component :is="settingsComponent" />

    <LinkSettings
      v-if="activeBlock.link !== undefined || activeBlock.type === 'Image' || activeBlock.type === 'Button' || activeBlock.type === 'Icon'"
    />

    <BackgroundSettings
      :background="activeBlock.style.background"
      :allowedModes="bgAllowedModes"
      @update="onBackgroundUpdate"
    />

    <SidesField
      :modelValue="ensureSides(activeBlock, 'padding')"
      :label="t('block.padding')"
      @update:modelValue="onPaddingUpdate"
    />

    <SidesField
      :modelValue="ensureSides(activeBlock, 'margin')"
      :label="t('block.margin')"
      @update:modelValue="onMarginUpdate"
    />

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
        <tr v-for="k in coordsKeys" :key="k.key">
          <td class="text-center">
            <component :is="k.icon" :size="16" />
          </td>
          <td v-for="m in modes" :key="m.key" class="px-1">
            <input
              type="number"
              class="form-control form-control-sm text-center"
              :value="getField(m.key, k.key).value"
              :min="k.min"
              @input="getField(m.key, k.key).value = Number(($event.target as HTMLInputElement).value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </COffcanvasBody>
</template>
