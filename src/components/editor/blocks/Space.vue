<script lang="ts" setup>
const props = defineProps<{
  block: Block
  section: Section
}>()

const { blockRef, blockStyle, backgroundStyle, onContextMenu } = useBlockBase(
  () => props.block,
  () => props.section
)

const dividerStyle = computed(() => {
  const d = props.block.divider
  if (!d?.active) return null
  return {
    borderTop: `${d.thick}px ${d.mode} ${d.color}`
  }
})
</script>

<template>
  <div ref="blockRef" class="block" :style="blockStyle" @contextmenu="onContextMenu">
    <div v-if="backgroundStyle.overlay" class="block-bg-overlay" :style="backgroundStyle.overlay" />
    <div v-if="dividerStyle" class="space-divider" :style="dividerStyle" />
    <div class="blockui resize"></div>
  </div>
</template>

<style scoped>
.space-divider {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
