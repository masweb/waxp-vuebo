<script lang="ts" setup>
const er = errorsStore()
const { errors } = storeToRefs(er)
</script>

<template>
  <div v-for="er in errors" :key="er.id" class="text-danger">
    <strong>{{ er.code }}</strong> <span>{{ er.error }}</span>
  </div>
</template>
