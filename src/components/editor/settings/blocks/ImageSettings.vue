<script setup lang="ts">
import { IconDeviceDesktop, IconDeviceTablet, IconDeviceMobile } from '@tabler/icons-vue'
import MediaPicker from '../fields/MediaPicker.vue'
import TextField from '../fields/TextField.vue'

const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const hs = historyStore()
const { t } = useI18n()

const ensureImage = () => {
  if (!activeBlock.value) return
  if (!activeBlock.value.image) {
    activeBlock.value.image = { url_desk: '', url_tab: '', url_mob: '', url_desk_dark: '', url_tab_dark: '', url_mob_dark: '', fit: 'width', lightbox: false }
  }
}

const patchImage = (partial: Partial<BlockImage>) => {
  if (!activeBlock.value) return
  hs.snapshot()
  ensureImage()
  activeBlock.value.image = { ...activeBlock.value.image!, ...partial }
}

const urlDesk = computed({
  get: () => activeBlock.value?.image?.url_desk ?? '',
  set: (v: string) => patchImage({ url_desk: v })
})

const urlTab = computed({
  get: () => activeBlock.value?.image?.url_tab ?? '',
  set: (v: string) => patchImage({ url_tab: v })
})

const urlMob = computed({
  get: () => activeBlock.value?.image?.url_mob ?? '',
  set: (v: string) => patchImage({ url_mob: v })
})

const urlDeskDark = computed({
  get: () => activeBlock.value?.image?.url_desk_dark ?? '',
  set: (v: string) => patchImage({ url_desk_dark: v })
})

const urlTabDark = computed({
  get: () => activeBlock.value?.image?.url_tab_dark ?? '',
  set: (v: string) => patchImage({ url_tab_dark: v })
})

const urlMobDark = computed({
  get: () => activeBlock.value?.image?.url_mob_dark ?? '',
  set: (v: string) => patchImage({ url_mob_dark: v })
})

const fit = computed({
  get: () => activeBlock.value?.image?.fit ?? 'cover',
  set: (v: BlockImageFit) => patchImage({ fit: v })
})

const altText = computed({
  get: () => activeBlock.value?.locales?.alt ?? '',
  set: (v: string) => {
    if (!activeBlock.value) return
    hs.snapshot()
    if (!activeBlock.value.locales) activeBlock.value.locales = {}
    activeBlock.value.locales.alt = v
  }
})

const lightbox = computed({
  get: () => activeBlock.value?.image?.lightbox ?? false,
  set: (v: boolean) => patchImage({ lightbox: v })
})
</script>

<template>
  <hr class="my-3" />
  <div class="mb-3">
    <label class="form-label mb-2">{{ t('block.imageUrls') }}</label>
    <div class="d-flex gap-3">
      <div class="text-center d-flex flex-column align-items-center">
        <MediaPicker :url="urlDesk" @select="urlDesk = $event" @clear="urlDesk = ''">
          <template #icon><IconDeviceDesktop :size="20" /></template>
        </MediaPicker>
        <div class="small text-muted mt-1">{{ t('background.desktopImage') }}</div>
      </div>
      <div class="text-center d-flex flex-column align-items-center">
        <MediaPicker :url="urlTab" @select="urlTab = $event" @clear="urlTab = ''">
          <template #icon><IconDeviceTablet :size="20" /></template>
        </MediaPicker>
        <div class="small text-muted mt-1">{{ t('background.tabletImage') }}</div>
      </div>
      <div class="text-center d-flex flex-column align-items-center">
        <MediaPicker :url="urlMob" @select="urlMob = $event" @clear="urlMob = ''">
          <template #icon><IconDeviceMobile :size="20" /></template>
        </MediaPicker>
        <div class="small text-muted mt-1">{{ t('background.mobileImage') }}</div>
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label mb-2">{{ t('block.imageUrlsDark') }}</label>
    <div class="d-flex gap-3">
      <div class="text-center d-flex flex-column align-items-center">
        <MediaPicker :url="urlDeskDark" @select="urlDeskDark = $event" @clear="urlDeskDark = ''">
          <template #icon><IconDeviceDesktop :size="20" /></template>
        </MediaPicker>
        <div class="small text-muted mt-1">{{ t('background.desktopImage') }}</div>
      </div>
      <div class="text-center d-flex flex-column align-items-center">
        <MediaPicker :url="urlTabDark" @select="urlTabDark = $event" @clear="urlTabDark = ''">
          <template #icon><IconDeviceTablet :size="20" /></template>
        </MediaPicker>
        <div class="small text-muted mt-1">{{ t('background.tabletImage') }}</div>
      </div>
      <div class="text-center d-flex flex-column align-items-center">
        <MediaPicker :url="urlMobDark" @select="urlMobDark = $event" @clear="urlMobDark = ''">
          <template #icon><IconDeviceMobile :size="20" /></template>
        </MediaPicker>
        <div class="small text-muted mt-1">{{ t('background.mobileImage') }}</div>
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label mb-1">{{ t('block.imageFit') }}</label>
    <div class="d-flex btn-group">
      <button
        class="btn btn-sm"
        :class="fit === 'cover' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="fit = 'cover'"
      >
        {{ t('block.fitCover') }}
      </button>
      <button
        class="btn btn-sm"
        :class="fit === 'width' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="fit = 'width'"
      >
        {{ t('block.fitWidth') }}
      </button>
      <button
        class="btn btn-sm"
        :class="fit === 'height' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="fit = 'height'"
      >
        {{ t('block.fitHeight') }}
      </button>
    </div>
    <div class="form-text">{{ t('block.imageFitHint') }}</div>
  </div>

  <div class="mb-3">
    <TextField v-model="altText" :label="t('block.imageAlt')" :placeholder="t('block.imageAltHint')" />
  </div>

  <div class="mb-3">
    <div class="form-check form-switch">
      <input id="lightbox-switch" class="form-check-input" type="checkbox" role="switch" v-model="lightbox" />
      <label class="form-check-label" for="lightbox-switch">{{ t('block.lightbox') }}</label>
    </div>
    <div class="form-text">{{ t('block.lightboxHint') }}</div>
  </div>
</template>
