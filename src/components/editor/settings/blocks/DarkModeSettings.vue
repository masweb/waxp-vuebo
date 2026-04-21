<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
import ColorPicker from '../fields/ColorPicker.vue'
import NumberRange from '../fields/NumberRange.vue'

const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const hs = historyStore()
const { t } = useI18n()
const st = siteStore()

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

const fontSize = computed({
  get: () => activeBlock.value?.fontSize ?? st.site?.options.fontSize ?? 1,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.fontSize = v
  }
})

const resetFontSize = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.fontSize = null
}
</script>

<template>
  <hr class="my-3" />
  <div class="mb-3">
    <ColorPicker
      :color="activeBlock?.color ?? ''"
      :label="t('block.colorLight')"
      @update:color="onColorLightUpdate"
    />
  </div>
  <div class="mb-3">
    <ColorPicker
      :color="activeBlock?.darkColor ?? ''"
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
</template>
