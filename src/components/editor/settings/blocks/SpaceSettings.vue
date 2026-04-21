<script setup lang="ts">
import ColorPicker from '../fields/ColorPicker.vue'
import NumberRange from '../fields/NumberRange.vue'

const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const hs = historyStore()
const { t } = useI18n()

const ensureDivider = () => {
  if (!activeBlock.value) return
  if (!activeBlock.value.divider) {
    activeBlock.value.divider = { active: false, color: '#cccccc', thick: '1', mode: 'solid' }
  }
}

const dividerActive = computed({
  get: () => activeBlock.value?.divider?.active ?? false,
  set: (v: boolean) => {
    if (!activeBlock.value) return
    hs.snapshot()
    ensureDivider()
    activeBlock.value.divider!.active = v
  }
})

const dividerColor = computed({
  get: () => activeBlock.value?.divider?.color ?? '#cccccc',
  set: (v: string) => {
    if (!activeBlock.value?.divider) return
    hs.snapshot()
    activeBlock.value.divider.color = v
  }
})

const dividerThick = computed({
  get: () => Number(activeBlock.value?.divider?.thick ?? 1),
  set: (v: number) => {
    if (!activeBlock.value?.divider) return
    hs.snapshot()
    activeBlock.value.divider.thick = String(v)
  }
})

const dividerMode = computed({
  get: () => activeBlock.value?.divider?.mode ?? 'solid',
  set: (v: string) => {
    if (!activeBlock.value?.divider) return
    hs.snapshot()
    activeBlock.value.divider.mode = v as SideBorder['mode']
  }
})
</script>

<template>
  <hr class="my-3" />
  <div class="mb-3">
    <div class="form-check form-switch">
      <input
        id="divider-active"
        class="form-check-input"
        type="checkbox"
        role="switch"
        :checked="dividerActive"
        @change="dividerActive = ($event.target as HTMLInputElement).checked"
      />
      <label class="form-check-label" for="divider-active">{{ t('block.divider') }}</label>
    </div>
  </div>
  <template v-if="dividerActive">
    <div class="mb-3">
      <ColorPicker
        :color="dividerColor"
        :label="t('block.dividerColor')"
        @update:color="dividerColor = $event"
      />
    </div>
    <div class="mb-3">
      <NumberRange
        v-model="dividerThick"
        :label="t('block.dividerThick')"
        :min="1"
        :max="20"
        :step="1"
      />
    </div>
    <div class="mb-3">
      <label class="form-label mb-1">{{ t('block.dividerStyle') }}</label>
      <select class="form-select form-select-sm" v-model="dividerMode">
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
        <option value="dotted">Dotted</option>
        <option value="double">Double</option>
        <option value="groove">Groove</option>
        <option value="ridge">Ridge</option>
        <option value="inset">Inset</option>
        <option value="outset">Outset</option>
      </select>
    </div>
  </template>
</template>
