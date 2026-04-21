<script lang="ts" setup>
import {
  IconPhoto,
  IconColorSwatch,
  IconBleachNoChlorine,
  IconDeviceDesktop,
  IconDeviceTablet,
  IconDeviceMobile
} from '@tabler/icons-vue'

const props = withDefaults(
  defineProps<{
    background: Background
    allowedModes?: Background['mode'][]
  }>(),
  { allowedModes: () => ['none', 'color', 'gradient', 'image'] as Background['mode'][] }
)

const emit = defineEmits<{
  (e: 'update', bg: Background): void
}>()

const { t } = useI18n()

const allModeOptions: { key: Background['mode']; label: string; icon: any }[] = [
  { key: 'none', label: t('editor.color.none'), icon: null },
  { key: 'color', label: t('background.color'), icon: IconColorSwatch },
  { key: 'gradient', label: t('background.gradient'), icon: IconBleachNoChlorine },
  { key: 'image', label: t('background.image'), icon: IconPhoto }
]

const modeOptions = computed(() =>
  allModeOptions.filter(opt => props.allowedModes.includes(opt.key))
)

const posOptions: { key: Background['pos']; label: string }[] = [
  { key: 'img', label: 'Original' },
  { key: 'cover', label: 'Cover' },
  { key: 'contain', label: 'Contain' },
  { key: 'top', label: 'Top' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' }
]

const patch = (partial: Partial<Background>) => {
  emit('update', { ...props.background, ...partial })
}

const currentMode = computed(() => props.background.mode)

watch(
  () => props.allowedModes,
  (modes) => {
    if (modes.length === 1 && props.background.mode !== modes[0]) {
      patch({ mode: modes[0] })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <div v-if="modeOptions.length > 1" class="mb-3">
      <label class="d-block mb-2">{{ t('background.mode') }}</label>
      <div class="d-flex btn-group">
        <button
          v-for="opt in modeOptions"
          :key="opt.key"
          class="btn btn-sm"
          :class="currentMode === opt.key ? 'btn-primary' : 'btn-outline-secondary'"
          @click="patch({ mode: opt.key })"
        >
          <component :is="opt.icon" v-if="opt.icon" :size="18" stroke-width="1" class="me-1" />
          <span class="small">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="currentMode === 'color'" class="mb-3">
      <ColorPicker
        :label="t('background.lightColor')"
        :color="background.lightColor"
        @update:color="patch({ lightColor: $event })"
      />
      <ColorPicker
        :label="t('background.darkColor')"
        :color="background.darkcolorColor"
        @update:color="patch({ darkcolorColor: $event })"
      />
    </div>

    <div v-if="currentMode === 'gradient'" class="mb-3">
      <ColorPicker
        :label="t('background.gradLightA')"
        :color="background.lightGradA"
        @update:color="patch({ lightGradA: $event })"
      />
      <ColorPicker
        :label="t('background.gradLightB')"
        :color="background.lightGradB"
        @update:color="patch({ lightGradB: $event })"
      />
      <ColorPicker
        :label="t('background.gradDarkA')"
        :color="background.darkGradA"
        @update:color="patch({ darkGradA: $event })"
      />
      <ColorPicker
        :label="t('background.gradDarkB')"
        :color="background.darkGradB"
        @update:color="patch({ darkGradB: $event })"
      />
      <div class="d-flex align-items-center gap-2 mb-1">
        <label class="small text-secondary mb-0" style="min-width: 2.5rem">{{ t('background.degrees') }}</label>
        <input
          type="number"
          class="form-control form-control-sm"
          style="width: 4.5rem"
          :value="background.gradDeg"
          min="0"
          max="360"
          @input="patch({ gradDeg: ($event.target as HTMLInputElement).value })"
        />
        <span class="small text-muted">°</span>
      </div>
    </div>

    <div v-if="currentMode === 'image'" class="mb-3">
      <div class="d-flex gap-2">
        <div class="text-center d-flex flex-column align-items-center">
          <MediaPicker
            :url="background.url_desk"
            @select="patch({ url_desk: $event })"
            @clear="patch({ url_desk: '' })"
          >
            <template #icon><IconDeviceDesktop :size="20" /></template>
          </MediaPicker>
          <div class="small text-muted mt-1">{{ t('background.desktopImage') }}</div>
        </div>
        <div class="text-center d-flex flex-column align-items-center">
          <MediaPicker :url="background.url_tab" @select="patch({ url_tab: $event })" @clear="patch({ url_tab: '' })">
            <template #icon><IconDeviceTablet :size="20" /></template>
          </MediaPicker>
          <div class="small text-muted mt-1">{{ t('background.tabletImage') }}</div>
        </div>
        <div class="text-center d-flex flex-column align-items-center">
          <MediaPicker :url="background.url_mov" @select="patch({ url_mov: $event })" @clear="patch({ url_mov: '' })">
            <template #icon><IconDeviceMobile :size="20" /></template>
          </MediaPicker>
          <div class="small text-muted mt-1">{{ t('background.mobileImage') }}</div>
        </div>
      </div>

      <div class="mt-2">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <label class="mb-0">{{ t('background.fixed') }}</label>
          <CFormSwitch :checked="background.fix_img_back" @change="patch({ fix_img_back: !background.fix_img_back })" />
        </div>
      </div>

      <div class="mb-2">
        <label class="d-block mb-1">{{ t('background.position') }}</label>
        <select
          class="form-select form-select-sm"
          :value="background.pos"
          @change="patch({ pos: ($event.target as HTMLSelectElement).value as Background['pos'] })"
        >
          <option v-for="p in posOptions" :key="p.key" :value="p.key">{{ p.label }}</option>
        </select>
      </div>

      <div class="d-flex align-items-center justify-content-between mb-2">
        <label class="mb-0">{{ t('background.repeat') }}</label>
        <CFormSwitch :checked="background.repeat" @change="patch({ repeat: !background.repeat })" />
      </div>

      <SectionRange
        :modelValue="Number(background.opacity || 1)"
        :label="t('background.opacity')"
        :min="0"
        :max="1"
        :step="0.05"
        @update:modelValue="patch({ opacity: String($event) })"
      />
    </div>
  </div>
</template>
