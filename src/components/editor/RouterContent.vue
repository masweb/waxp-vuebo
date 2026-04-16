<script lang="ts" setup>
const props = defineProps<{
  pageId: number
  pagePath: string
  locale: string
}>()
const pg = pageStore()
const { page } = storeToRefs(pg)

const loadPage = () => pg.getPage(props.pageId)

onMounted(loadPage)
watch(() => props.pageId, loadPage)
</script>
<template>
  <div class="page-content">
    <div v-for="section in page?.layout" :key="section.id" class="section">
      <PageSection :section="section" />
    </div>
  </div>
</template>
