<script setup lang="ts">
const stt = settingsStore()
const { showsettings } = storeToRefs(stt)
const st = siteStore()
const { site } = storeToRefs(st)
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>Opciones del sitio</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody>
    <!-- <div>{{ st?.site?.options }}</div> -->
    <!-- <div>{{ site?.options.lightColor }}</div> -->

    <ColorPicker
      label="Color light"
      :color="site?.options.lightColor"
      @update:color="site!.options.lightColor = $event"
    />
    <ColorPicker
      label="Background light"
      :color="site?.options.lightBackColor"
      @update:color="site!.options.lightBackColor = $event"
    />
    <ColorPicker label="Color dark" :color="site?.options.darkColor" @update:color="site!.options.darkColor = $event" />
    <ColorPicker
      label="Background dark"
      :color="site?.options.darkBackColor"
      @update:color="site!.options.darkBackColor = $event"
    />
  </COffcanvasBody>
</template>
