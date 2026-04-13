<script lang="ts" setup>
const sites: Ref<Site[]> = ref([])

onMounted(() => {
  getSites()
})

const getSites = async () => {
  sites.value = await useApi('/api/sites')
}
</script>

<template>
  <div>SiteManager</div>
  {{ sites }}
</template>
