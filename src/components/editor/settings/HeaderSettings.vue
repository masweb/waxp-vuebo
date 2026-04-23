<script lang="ts" setup>
import type { Font, HeaderStyle, HeadersConfig } from '@/types/defaultOptions'
import FontFamilyField from './fields/FontFamilyField.vue'

const LEVELS: (keyof HeadersConfig)[] = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']

const props = defineProps<{
  modelValue: HeadersConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HeadersConfig]
}>()

const hs = historyStore()
const { t } = useI18n()

const updateLevel = (level: keyof HeadersConfig, patch: Partial<HeaderStyle>) => {
  if (!props.modelValue[level]) return
  hs.snapshot()
  const updated = { ...props.modelValue }
  updated[level] = { ...updated[level], ...patch }
  emit('update:modelValue', updated)
}

const headerFont = (level: keyof HeadersConfig): Font => {
  const cfg = props.modelValue[level]
  return { family: cfg.family, weight: cfg.weight, italic: cfg.italic ?? false }
}

const setHeaderFont = (level: keyof HeadersConfig, font: Font) => {
  updateLevel(level, { family: font.family, weight: font.weight, italic: font.italic })
}

const openLevel = ref<keyof HeadersConfig | null>(null)

const toggle = (level: keyof HeadersConfig) => {
  openLevel.value = openLevel.value === level ? null : level
}
</script>

<template>
  <div class="header-settings mt-3">
    <label class="form-label mb-2">{{ t('siteSettings.headers') }}</label>
    <div v-for="level in LEVELS" :key="level" class="header-level">
      <button class="header-level-btn" :class="{ open: openLevel === level }" @click="toggle(level)">
        <span class="header-level-name">{{ level }}</span>
        <span class="header-level-preview" :style="{ fontSize: modelValue[level]?.size + 'em', fontFamily: modelValue[level]?.family, fontWeight: modelValue[level]?.weight, fontStyle: modelValue[level]?.italic ? 'italic' : 'normal' }">
          Aa
        </span>
        <span class="header-level-chevron">&#8250;</span>
      </button>
      <div v-if="openLevel === level" class="header-level-body">
        <NumberRange
          :modelValue="modelValue[level]?.size ?? 1"
          :label="t('block.fontSize')"
          :min="0.1"
          :max="6"
          :step="0.05"
          @update:modelValue="updateLevel(level, { size: $event })"
        />
        <NumberRange
          :modelValue="modelValue[level]?.lineHeight ?? 1.2"
          :label="t('block.lineHeight')"
          :min="0.1"
          :max="4"
          :step="0.05"
          @update:modelValue="updateLevel(level, { lineHeight: $event })"
        />
        <FontFamilyField :modelValue="headerFont(level)" @update:modelValue="setHeaderFont(level, $event)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-settings {
  border-top: 1px solid var(--cui-border-color, #dee2e6);
  padding-top: 0.75rem;
}

.header-level {
  border-bottom: 1px solid var(--cui-border-color, #dee2e6);
}

.header-level-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 0.875rem;
}

.header-level-name {
  width: 2rem;
  font-weight: 600;
}

.header-level-preview {
  flex: 1;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-level-chevron {
  transition: transform 0.15s ease;
  font-size: 1rem;
}

.header-level-btn.open .header-level-chevron {
  transform: rotate(90deg);
}

.header-level-body {
  padding: 0 0 0.75rem 0;
}
</style>
