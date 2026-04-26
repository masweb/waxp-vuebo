<script lang="ts" setup>
import {
  IconTextPlus,
  IconPhoto,
  IconSpacingVertical,
  IconContrastFilled,
  IconLanguage,
  IconXboxB,
  IconMenu2,
  IconHome,
  IconClipboard
} from '@tabler/icons-vue'
import type { BlockType } from '@/stores/editorStore'
const ed = editorStore()
const pg = pageStore()
const { showModalNewBlock } = storeToRefs(ed)
const { t } = useI18n()

const pick = (type: BlockType) => ed.selectBlockType(type)
</script>
<template>
  <CModal :visible="showModalNewBlock" @close="showModalNewBlock = false" size="sm">
    <CModalHeader>{{ t('block.newBlock') }}</CModalHeader>
    <CModalBody class="d-flex justify-content-center flex-wrap p-0 toolsblock">
      <button v-if="pg.clipboardBlock" class="btn d-flex flex-column align-items-center" @click="pick('Paste')">
        <IconClipboard size="40" stroke-width="1" />
        <small>{{ t('block.paste') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('Text')">
        <IconTextPlus size="40" stroke-width="1" />
        <small>{{ t('block.text') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('Image')">
        <IconPhoto size="40" stroke-width="1" />
        <small>{{ t('block.image') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('Button')">
        <IconXboxB size="40" stroke-width="1" />
        <small>{{ t('block.button') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('Icon')">
        <IconHome size="40" stroke-width="1" />
        <small>{{ t('block.icon') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('Menu')">
        <IconMenu2 size="40" stroke-width="1" />
        <small>{{ t('block.menu') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('Space')">
        <IconSpacingVertical size="40" stroke-width="1" />
        <small>{{ t('block.space') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('DarkMode')">
        <IconContrastFilled size="40" stroke-width="1" />
        <small>{{ t('block.darkModeBlock') }}</small>
      </button>
      <button class="btn d-flex flex-column align-items-center" @click="pick('LanguageSwitcher')">
        <IconLanguage size="40" stroke-width="1" />
        <small>{{ t('block.languageSwitcher') }}</small>
      </button>
    </CModalBody>
  </CModal>
</template>
