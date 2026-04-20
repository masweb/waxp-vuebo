<script lang="ts" setup>
import { IconPhoto, IconColorSwatch, IconBleachNoChlorine } from '@tabler/icons-vue'

const props = defineProps<{
  background: Background
}>()

const emit = defineEmits<{
  (e: 'update', bg: Background): void
}>()

const { t } = useI18n()

const modeOptions: { key: Background['mode']; label: string; icon: any }[] = [
  { key: 'none', label: t('editor.color.none'), icon: null },
  { key: 'color', label: t('background.color'), icon: IconColorSwatch },
  { key: 'gradient', label: t('background.gradient'), icon: IconBleachNoChlorine },
  { key: 'image', label: t('background.image'), icon: IconPhoto }
]

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
</script>

<template>
  <div>
    <div class="mb-3">
      <label class="d-block mb-2">{{ t('background.mode') }}</label>
      <div class="d-flex gap-2">
        <button
          v-for="opt in modeOptions"
          :key="opt.key"
          class="btn btn-sm"
          :class="currentMode === opt.key ? 'btn-primary' : 'btn-outline-secondary'"
          @click="patch({ mode: opt.key })"
        >
          <component :is="opt.icon" v-if="opt.icon" :size="22" class="me-1" />
          {{ opt.label }}
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
      <label class="d-block mb-1">{{ t('background.desktopImage') }}</label>
      <MediaPicker :url="background.url_desk" @select="patch({ url_desk: $event })" @clear="patch({ url_desk: '' })" />

      <label class="d-block mb-1 mt-2">{{ t('background.mobileImage') }}</label>
      <MediaPicker :url="background.url_mov" @select="patch({ url_mov: $event })" @clear="patch({ url_mov: '' })" />

      <label class="d-block mb-1 mt-2">{{ t('background.thumbnail') }}</label>
      <MediaPicker
        :url="background.url_thumb"
        @select="patch({ url_thumb: $event })"
        @clear="patch({ url_thumb: '' })"
      />

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
