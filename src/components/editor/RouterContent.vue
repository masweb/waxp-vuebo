<script lang="ts" setup>
const props = defineProps<{
  pageId: number
  pagePath: string
  locale: string
}>()
const pg = pageStore()
const st = siteStore()
const vp = viewportStore()
const { page } = storeToRefs(pg)
const { mode } = storeToRefs(vp)

const visibleSections = computed(
  () => page.value?.layout.filter(s => !s.style.hideOn?.includes(mode.value)) ?? []
)

const loadPage = () => pg.getPage(props.pageId)

onMounted(loadPage)
watch(() => props.pageId, loadPage)
</script>
<template>
  <div class="page-content" :class="{ 'hide-helpers': !vp.showBlocks }">
    <PageSection v-if="st.site?.options?.header" :section="st.site.options.header" fixed />
    <NewSection />
    <PageSection v-for="section in visibleSections" :key="section.id" :section="section" />
    <div class="flex-grow-1" />
    <PageSection v-if="st.site?.options?.footer" :section="st.site.options.footer" fixed />
  </div>
</template>
