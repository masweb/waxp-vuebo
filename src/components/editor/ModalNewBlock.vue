<script lang="ts" setup>
import { IconTextPlus, IconPhoto, IconSpacingVertical, IconContrastFilled } from '@tabler/icons-vue'
import type { BlockType } from '@/stores/editorStore'
const ed = editorStore()
const { showModalNewBlock } = storeToRefs(ed)
const { t } = useI18n()

const pick = (type: BlockType) => ed.selectBlockType(type)
</script>
<template>
  <CModal :visible="showModalNewBlock" @close="showModalNewBlock = false" alignment="top">
    <CModalHeader>{{ t('block.newBlock') }}</CModalHeader>
    <CModalBody class="d-flex justify-content-center py-4 toolsblock">
      <button class="btn btn-secondary d-flex flex-column align-items-center" @click="pick('Text')">
        <IconTextPlus size="40" stroke-width="1" />
        <small>{{ t('block.text') }}</small>
      </button>
      <button class="btn btn-secondary d-flex flex-column align-items-center" @click="pick('Image')">
        <IconPhoto size="40" stroke-width="1" />
        <small>{{ t('block.image') }}</small>
      </button>
      <button class="btn btn-secondary d-flex flex-column align-items-center" @click="pick('Space')">
        <IconSpacingVertical size="40" stroke-width="1" />
        <small>{{ t('block.space') }}</small>
      </button>
      <button class="btn btn-secondary d-flex flex-column align-items-center" @click="pick('DarkMode')">
        <IconContrastFilled size="40" stroke-width="1" />
        <small>{{ t('block.darkModeBlock') }}</small>
      </button>
    </CModalBody>
  </CModal>
</template>
