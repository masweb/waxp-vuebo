<script setup lang="ts">
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceDesktop,
  IconArrowsHorizontal,
  IconArrowsVertical,
  IconLayoutColumns,
  IconLayoutRows,
  IconX
} from '@tabler/icons-vue'
import ColorPicker from './fields/ColorPicker.vue'
import NumberRange from './fields/NumberRange.vue'

const stt = settingsStore()
const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const { showsettings } = storeToRefs(stt)
const hs = historyStore()
const { t } = useI18n()
const st = siteStore()

const isTextBlock = computed(() => activeBlock.value?.type === 'Text')

const onBackgroundUpdate = (bg: Background) => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.style.background = bg
}

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
const hasLineHeight = computed(() => activeBlock.value?.lineHeight != null)

const fontSize = computed({
  get: () => activeBlock.value?.fontSize ?? st.site?.options.fontSize ?? 1,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.fontSize = v
  }
})

const lineHeight = computed({
  get: () => activeBlock.value?.lineHeight ?? st.site?.options.lineHeight ?? 1.4,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.lineHeight = v
  }
})

const resetFontSize = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.fontSize = null
}

const resetLineHeight = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.lineHeight = null
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
    <!-- {{ activeBlock }} -->
    <div class="mb-3">
      <label class="small text-secondary">{{ t('block.type') }}</label>
      <div class="fw-semibold">{{ activeBlock.type }}</div>
    </div>

    <template v-if="isTextBlock">
      <hr class="my-3" />
      <div class="mb-3">
        <ColorPicker
          :color="activeBlock.color ?? ''"
          :label="t('block.colorLight')"
          @update:color="onColorLightUpdate"
        />
      </div>
      <div class="mb-3">
        <ColorPicker
          :color="activeBlock.darkColor ?? ''"
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
      <div class="mb-3">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <label class="form-label mb-0">{{ t('block.lineHeight') }}</label>
          <span v-if="!hasLineHeight" class="badge text-bg-secondary">{{ t('block.inherited') }}</span>
          <button v-else class="btn btn-sm btn-link p-0 text-secondary" @click="resetLineHeight">
            <IconX :size="14" />
          </button>
        </div>
        <NumberRange v-model="lineHeight" :min="0.1" :max="5" :step="0.1" />
      </div>
    </template>
    <BackgroundSettings :background="activeBlock.style.background" @update="onBackgroundUpdate" />

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
