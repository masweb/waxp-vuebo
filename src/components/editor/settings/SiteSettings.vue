<script setup lang="ts">
const stt = settingsStore()
const { showsettings } = storeToRefs(stt)
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>Opciones del sitio</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody> Bodi opciones </COffcanvasBody>
</template>
