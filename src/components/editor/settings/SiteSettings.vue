<script lang="ts" setup>
const stt = settingsStore()
const { showsettings } = storeToRefs(stt)
const st = siteStore()
const { site } = storeToRefs(st)
const hs = historyStore()

const updateColor = (key: string, value: string) => {
  if (!site.value?.options) return
  hs.snapshot()
  ;(site.value.options as any)[key] = value
}

const updateOption = (key: string, value: number) => {
  if (!site.value?.options) return
  hs.snapshot()
  ;(site.value.options as any)[key] = value
}
</script>

<template>
  <COffcanvasHeader>
    <COffcanvasTitle>Opciones del sitio</COffcanvasTitle>
    <CCloseButton class="text-reset" @click="showsettings = false" />
  </COffcanvasHeader>
  <COffcanvasBody>
    <ColorPicker
      label="Color light"
      :color="site?.options.lightColor"
      @update:color="updateColor('lightColor', $event)"
    />
    <ColorPicker
      label="Background light"
      :color="site?.options.lightBackColor"
      @update:color="updateColor('lightBackColor', $event)"
    />
    <ColorPicker label="Color dark" :color="site?.options.darkColor" @update:color="updateColor('darkColor', $event)" />
    <ColorPicker
      label="Background dark"
      :color="site?.options.darkBackColor"
      @update:color="updateColor('darkBackColor', $event)"
    />

    <FontManager />

    <SectionRange
      :modelValue="site?.options.desktopWidth ?? 1200"
      label="Desktop width"
      :min="site?.options.tabletBP ?? 767"
      :max="2000"
      @update:modelValue="updateOption('desktopWidth', $event)"
    />
    <SectionRange
      :modelValue="site?.options.tabletBP ?? 1024"
      label="Tablet breakpoint"
      :min="site?.options.mobileBP ?? 767"
      :max="site?.options.desktopWidth ?? 1200"
      @update:modelValue="updateOption('tabletBP', $event)"
    />
    <SectionRange
      :modelValue="site?.options.mobileBP ?? 767"
      label="Mobile breakpoint"
      :min="320"
      :max="site?.options.tabletBP ?? 1024"
      @update:modelValue="updateOption('mobileBP', $event)"
    />
  </COffcanvasBody>
</template>
