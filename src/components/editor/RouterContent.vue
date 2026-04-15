<script lang="ts" setup>
const props = defineProps<{
  pageId: number
  pagePath: string
  locale: string
}>()
const st = siteStore()

onMounted(() => {
  getPage()
})

const getPage = async () => {
  const resp: Page = await useApi(`/api/sites/${st?.site?.id}/pages/${props.pageId}`).catch(
    error => error.data as ApiError
  )
  console.log(resp)
}
</script>
<template>
  RouterContent.vue
  <div>{{ pageId }}</div>
  <div>{{ locale }}</div>
  <div>{{ pagePath }}</div>
</template>
