<script setup lang="ts">
const stt = settingsStore()
const { showsettings } = storeToRefs(stt)
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>Opciones de rutas</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody> Bodi opciones de rutas </COffcanvasBody>
</template>
