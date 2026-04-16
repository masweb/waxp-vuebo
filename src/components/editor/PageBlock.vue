<script lang="ts" setup>
const props = defineProps<{
  block: Block;
}>();

const { blockStyle } = useBlockGrid(() => props.block);
</script>

<template>
  <div class="block" :style="blockStyle">
    {{ block.content }}
  </div>
</template>
