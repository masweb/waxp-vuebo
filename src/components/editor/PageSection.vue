<script lang="ts" setup>
const props = defineProps<{
  section: Section
}>()

const vp = viewportStore()

const bpConfig = computed(() => props.section[vp.mode as keyof Section] as BreakpointSize)

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${bpConfig.value.cols}, 1fr)`,
  gridTemplateRows: `repeat(${bpConfig.value.rows}, 1fr)`,
  gap: `${bpConfig.value.gap}px`
}))

const cellCount = computed(() => bpConfig.value.cols * bpConfig.value.rows)
</script>

<template>
  <div class="section" :style="gridStyle">
    <div v-for="c in cellCount" :key="c" class="section-cell" />
  </div>
</template>
