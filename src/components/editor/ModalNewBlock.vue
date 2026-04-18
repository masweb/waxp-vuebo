<script lang="ts" setup>
import { IconTextPlus, IconPhoto, IconSpacingVertical } from '@tabler/icons-vue'
import type { BlockType } from '@/stores/editorStore'
const ed = editorStore()
const { showModalNewBlock } = storeToRefs(ed)

const pick = (type: BlockType) => ed.selectBlockType(type)
</script>
<template>
  <CModal :visible="showModalNewBlock" @close="showModalNewBlock = false" alignment="top">
    <CModalBody class="d-flex justify-content-center gap-1 py-4">
      <button class="btn btn-secondary d-flex flex-column align-items-center gap-1 px-4 py-3" @click="pick('Text')">
        <IconTextPlus size="40" stroke-width="1" />
        <small>Texto</small>
      </button>
      <button class="btn btn-secondary d-flex flex-column align-items-center gap-1 px-4 py-3" @click="pick('Image')">
        <IconPhoto size="40" stroke-width="1" />
        <small>Imagen</small>
      </button>
      <button class="btn btn-secondary d-flex flex-column align-items-center gap-1 px-4 py-3" @click="pick('Space')">
        <IconSpacingVertical size="40" stroke-width="1" />
        <small>Espacio</small>
      </button>
    </CModalBody>
  </CModal>
</template>
