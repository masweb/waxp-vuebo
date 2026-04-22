<script setup lang="ts">
const stt = settingsStore()
const { showsettings, setting } = storeToRefs(stt)
const pg = pageStore()
const { activeBlock } = storeToRefs(pg)

watch(activeBlock, (val) => {
  if (!val && setting.value === 'BlockSettings') showsettings.value = false
})

const components: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  SiteSettings: defineAsyncComponent(() => import('@/components/editor/settings/SiteSettings.vue')),
  RoutingSettings: defineAsyncComponent(() => import('@/components/editor/settings/routing/RoutingSettings.vue')),
  SectionSettings: defineAsyncComponent(() => import('@/components/editor/settings/SectionSettings.vue')),
  BlockSettings: defineAsyncComponent(() => import('@/components/editor/settings/BlockSettings.vue'))
}
</script>

<template>
  <COffcanvas
    :backdrop="false"
    placement="start"
    scroll
    :visible="showsettings"
    @hide="showsettings = !showsettings"
    class="setting-pane"
  >
    <component :is="components[setting!]" v-if="setting" />
  </COffcanvas>
</template>
