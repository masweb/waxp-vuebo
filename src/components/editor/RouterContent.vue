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

const lateralMargin = computed(() => {
  const opts = st.site?.options
  const margin = vp.mode === 'mobile' ? (opts?.mobileMargin ?? 10)
    : vp.mode === 'tablet' ? (opts?.tabletMargin ?? 10)
    : (opts?.desktopMargin ?? 10)
  if (!margin) return ''
  return `padding-left: ${margin}px; padding-right: ${margin}px;`
})

const visibleSections = computed(
  () => page.value?.layout.filter(s => !s.style.hideOn?.includes(mode.value)) ?? []
)

const loadPage = () => pg.getPage(props.pageId, props.locale)

onMounted(async () => {
  await st.loadSiteForLocale(props.locale)
  loadPage()
})
watch(() => props.pageId, loadPage)
watch(() => props.locale, async (loc) => {
  await st.loadSiteForLocale(loc)
  loadPage()
})
</script>
<template>
  <div class="page-content" :class="{ 'hide-helpers': !vp.showBlocks }" :style="lateralMargin">
    <PageSection v-if="st.site?.options?.header" :section="st.site.options.header" fixed />
    <NewSection />
    <PageSection v-for="section in visibleSections" :key="section.id" :section="section" />
    <div class="flex-grow-1" />
    <PageSection v-if="st.site?.options?.footer" :section="st.site.options.footer" fixed />
  </div>
</template>
