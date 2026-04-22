<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
import ColorPicker from '../fields/ColorPicker.vue'
import NumberRange from '../fields/NumberRange.vue'
import TextField from '../fields/TextField.vue'

const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const hs = historyStore()
const st = siteStore()
const { t } = useI18n()

const btn = computed(() => activeBlock.value?.button)

const patchColor = (
  field: 'bg' | 'hover' | 'active' | 'focus' | 'textColor' | 'hoverTextColor' | 'activeTextColor' | 'borderColor',
  mode: 'light' | 'dark',
  color: string
) => {
  if (!btn.value) return
  hs.snapshot()
  btn.value[field] = { ...btn.value[field], [mode]: color }
}

const labelText = computed({
  get: () => activeBlock.value?.locales?.label ?? '',
  set: (v: string) => {
    if (!activeBlock.value) return
    hs.snapshot()
    if (!activeBlock.value.locales) activeBlock.value.locales = {}
    activeBlock.value.locales.label = v
  }
})

const width = computed({
  get: () => Number(btn.value?.width ?? 100),
  set: (v: number) => {
    if (!activeBlock.value?.button) return
    hs.snapshot()
    activeBlock.value.button.width = String(v)
  }
})

const paddingAll = computed({
  get: () => Number(btn.value?.padding?.t ?? 10),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    const s = String(v)
    btn.value.padding = { t: s, r: s, b: s, l: s }
  }
})

const paddingTop = computed({
  get: () => Number(btn.value?.padding?.t ?? 10),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.padding.t = String(v)
  }
})

const paddingRight = computed({
  get: () => Number(btn.value?.padding?.r ?? 20),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.padding.r = String(v)
  }
})

const paddingBottom = computed({
  get: () => Number(btn.value?.padding?.b ?? 10),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.padding.b = String(v)
  }
})

const paddingLeft = computed({
  get: () => Number(btn.value?.padding?.l ?? 20),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.padding.l = String(v)
  }
})

const paddingLinked = ref(true)

const radiusAll = computed({
  get: () => Number(btn.value?.border?.radius?.tl ?? 6),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    const r = String(v)
    btn.value.border.radius = { tl: r, tr: r, br: r, bl: r }
  }
})

const radiusTl = computed({
  get: () => Number(btn.value?.border?.radius?.tl ?? 6),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.border.radius.tl = String(v)
  }
})

const radiusTr = computed({
  get: () => Number(btn.value?.border?.radius?.tr ?? 6),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.border.radius.tr = String(v)
  }
})

const radiusBr = computed({
  get: () => Number(btn.value?.border?.radius?.br ?? 6),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.border.radius.br = String(v)
  }
})

const radiusBl = computed({
  get: () => Number(btn.value?.border?.radius?.bl ?? 6),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.border.radius.bl = String(v)
  }
})

const radiusLinked = ref(true)

const borderActive = computed({
  get: () => btn.value?.border?.allBorders?.active ?? false,
  set: (v: boolean) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.border.allBorders.active = v
  }
})

const borderThick = computed({
  get: () => Number(btn.value?.border?.allBorders?.thick ?? 1),
  set: (v: number) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.border.allBorders.thick = String(v)
  }
})

const borderMode = computed({
  get: () => btn.value?.border?.allBorders?.mode ?? 'solid',
  set: (v: string) => {
    if (!btn.value) return
    hs.snapshot()
    btn.value.border.allBorders.mode = v as SideBorder['mode']
  }
})

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
</script>

<template>
  <hr class="my-3" />

  <div class="mb-3">
    <TextField v-model="labelText" :label="t('block.buttonLabel')" :placeholder="t('block.buttonLabelHint')" />
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.buttonBg') }}</label>
    <div class="row g-2">
      <div class="col-6">
        <ColorPicker
          :color="btn?.bg?.light ?? ''"
          :label="t('block.light')"
          @update:color="patchColor('bg', 'light', $event)"
        />
      </div>
      <div class="col-6">
        <ColorPicker
          :color="btn?.bg?.dark ?? ''"
          :label="t('block.dark')"
          @update:color="patchColor('bg', 'dark', $event)"
        />
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.buttonHover') }}</label>
    <div class="row g-2">
      <div class="col-6">
        <ColorPicker
          :color="btn?.hover?.light ?? ''"
          :label="t('block.light')"
          @update:color="patchColor('hover', 'light', $event)"
        />
      </div>
      <div class="col-6">
        <ColorPicker
          :color="btn?.hover?.dark ?? ''"
          :label="t('block.dark')"
          @update:color="patchColor('hover', 'dark', $event)"
        />
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.buttonActive') }}</label>
    <div class="row g-2">
      <div class="col-6">
        <ColorPicker
          :color="btn?.active?.light ?? ''"
          :label="t('block.light')"
          @update:color="patchColor('active', 'light', $event)"
        />
      </div>
      <div class="col-6">
        <ColorPicker
          :color="btn?.active?.dark ?? ''"
          :label="t('block.dark')"
          @update:color="patchColor('active', 'dark', $event)"
        />
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.buttonFocus') }}</label>
    <div class="row g-2">
      <div class="col-6">
        <ColorPicker
          :color="btn?.focus?.light ?? ''"
          :label="t('block.light')"
          @update:color="patchColor('focus', 'light', $event)"
        />
      </div>
      <div class="col-6">
        <ColorPicker
          :color="btn?.focus?.dark ?? ''"
          :label="t('block.dark')"
          @update:color="patchColor('focus', 'dark', $event)"
        />
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.buttonTextColor') }}</label>
    <div class="row g-2">
      <div class="col-6">
        <ColorPicker
          :color="btn?.textColor?.light ?? ''"
          :label="t('block.light')"
          @update:color="patchColor('textColor', 'light', $event)"
        />
      </div>
      <div class="col-6">
        <ColorPicker
          :color="btn?.textColor?.dark ?? ''"
          :label="t('block.dark')"
          @update:color="patchColor('textColor', 'dark', $event)"
        />
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.buttonHoverTextColor') }}</label>
    <div class="row g-2">
      <div class="col-6">
        <ColorPicker
          :color="btn?.hoverTextColor?.light ?? ''"
          :label="t('block.light')"
          @update:color="patchColor('hoverTextColor', 'light', $event)"
        />
      </div>
      <div class="col-6">
        <ColorPicker
          :color="btn?.hoverTextColor?.dark ?? ''"
          :label="t('block.dark')"
          @update:color="patchColor('hoverTextColor', 'dark', $event)"
        />
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.buttonActiveTextColor') }}</label>
    <div class="row g-2">
      <div class="col-6">
        <ColorPicker
          :color="btn?.activeTextColor?.light ?? ''"
          :label="t('block.light')"
          @update:color="patchColor('activeTextColor', 'light', $event)"
        />
      </div>
      <div class="col-6">
        <ColorPicker
          :color="btn?.activeTextColor?.dark ?? ''"
          :label="t('block.dark')"
          @update:color="patchColor('activeTextColor', 'dark', $event)"
        />
      </div>
    </div>
  </div>

  <hr class="my-3" />

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

  <hr class="my-3" />

  <div class="mb-3">
    <NumberRange v-model="width" :label="t('block.buttonWidth')" :min="10" :max="100" :step="1" />
  </div>

  <div class="mb-3">
    <div class="d-flex align-items-center justify-content-between mb-1">
      <label class="form-label mb-0">{{ t('block.buttonPadding') }}</label>
      <button class="btn btn-sm btn-link p-0 text-secondary" @click="paddingLinked = !paddingLinked">
        {{ paddingLinked ? t('block.buttonPaddingAll') : t('block.buttonPaddingIndividual') }}
      </button>
    </div>
    <NumberRange v-if="paddingLinked" v-model="paddingAll" :min="0" :max="40" :step="1" />
    <div v-else class="row g-2">
      <div class="col-6"><NumberRange v-model="paddingTop" label="↑" :min="0" :max="40" /></div>
      <div class="col-6"><NumberRange v-model="paddingRight" label="→" :min="0" :max="40" /></div>
      <div class="col-6"><NumberRange v-model="paddingBottom" label="↓" :min="0" :max="40" /></div>
      <div class="col-6"><NumberRange v-model="paddingLeft" label="←" :min="0" :max="40" /></div>
    </div>
  </div>

  <hr class="my-3" />

  <div class="mb-3">
    <div class="d-flex align-items-center justify-content-between mb-1">
      <label class="form-label mb-0">{{ t('block.buttonBorderRadius') }}</label>
      <button class="btn btn-sm btn-link p-0 text-secondary" @click="radiusLinked = !radiusLinked">
        {{ radiusLinked ? t('block.buttonPaddingAll') : t('block.buttonPaddingIndividual') }}
      </button>
    </div>
    <NumberRange v-if="radiusLinked" v-model="radiusAll" :min="0" :max="50" :step="1" />
    <div v-else class="row g-2">
      <div class="col-6"><NumberRange v-model="radiusTl" label="↖" :min="0" :max="50" /></div>
      <div class="col-6"><NumberRange v-model="radiusTr" label="↗" :min="0" :max="50" /></div>
      <div class="col-6"><NumberRange v-model="radiusBl" label="↙" :min="0" :max="50" /></div>
      <div class="col-6"><NumberRange v-model="radiusBr" label="↘" :min="0" :max="50" /></div>
    </div>
  </div>

  <div class="mb-3">
    <div class="form-check form-switch">
      <input
        id="btn-border-active"
        class="form-check-input"
        type="checkbox"
        role="switch"
        :checked="borderActive"
        @change="borderActive = ($event.target as HTMLInputElement).checked"
      />
      <label class="form-check-label" for="btn-border-active">{{ t('block.buttonBorder') }}</label>
    </div>
  </div>
  <template v-if="borderActive">
    <div class="mb-3">
      <label class="form-label fw-semibold mb-1">{{ t('block.buttonBorderColor') }}</label>
      <div class="row g-2">
        <div class="col-6">
          <ColorPicker
            :color="btn?.borderColor?.light ?? ''"
            :label="t('block.light')"
            @update:color="patchColor('borderColor', 'light', $event)"
          />
        </div>
        <div class="col-6">
          <ColorPicker
            :color="btn?.borderColor?.dark ?? ''"
            :label="t('block.dark')"
            @update:color="patchColor('borderColor', 'dark', $event)"
          />
        </div>
      </div>
    </div>
    <div class="mb-3">
      <NumberRange v-model="borderThick" :label="t('block.buttonBorderThick')" :min="1" :max="20" :step="1" />
    </div>
    <div class="mb-3">
      <label class="form-label mb-1">{{ t('block.buttonBorderStyle') }}</label>
      <select class="form-select form-select-sm" v-model="borderMode">
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
