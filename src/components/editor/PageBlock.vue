<script lang="ts" setup>
const props = defineProps<{
  block: Block
  section: Section
}>()

const blockComponents: Record<string, Component> = {
  Text: defineAsyncComponent(() => import('./blocks/Text.vue')),
  Image: defineAsyncComponent(() => import('./blocks/Image.vue')),
  Space: defineAsyncComponent(() => import('./blocks/Space.vue')),
  DarkMode: defineAsyncComponent(() => import('./blocks/DarkMode.vue')),
  LanguageSwitcher: defineAsyncComponent(() => import('./blocks/LanguageSwitcher.vue')),
  Button: defineAsyncComponent(() => import('./blocks/Button.vue')),
  Icon: defineAsyncComponent(() => import('./blocks/Icon.vue')),
  Menu: defineAsyncComponent(() => import('./blocks/Menu.vue'))
}

const blockComponent = computed(() => blockComponents[props.block.type])
</script>

<template>
  <component :is="blockComponent" :block="block" :section="section" />
</template>
