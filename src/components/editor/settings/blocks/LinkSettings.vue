<script setup lang="ts">
import TextField from '../fields/TextField.vue'

const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const hs = historyStore()
const st = siteStore()
const { t } = useI18n()

const allRoutes = computed(() => {
  const routes = st.site?.routes
  if (!routes) return []
  const result: { locale: string; path: string; page_id: number }[] = []
  for (const [locale, localeRoutes] of Object.entries(routes)) {
    for (const r of localeRoutes) {
      result.push({ locale, path: r.path, page_id: r.page_id })
    }
  }
  return result
})

const routesByLocale = computed(() => {
  const map = new Map<string, { path: string; page_id: number }[]>()
  for (const r of allRoutes.value) {
    let list = map.get(r.locale)
    if (!list) {
      list = []
      map.set(r.locale, list)
    }
    list.push({ path: r.path, page_id: r.page_id })
  }
  return map
})

const ensureLink = () => {
  if (!activeBlock.value) return
  if (!activeBlock.value.link) {
    activeBlock.value.link = { type: 'internal', url: '' }
  }
}

const linkActive = computed({
  get: () => !!activeBlock.value?.link,
  set: (v: boolean) => {
    if (!activeBlock.value) return
    hs.snapshot()
    if (v) {
      activeBlock.value.link = { type: 'internal', url: '' }
    } else {
      activeBlock.value.link = undefined
    }
  }
})

const linkType = computed({
  get: () => activeBlock.value?.link?.type ?? 'internal',
  set: (v: BlockLinkType) => {
    if (!activeBlock.value?.link) return
    hs.snapshot()
    activeBlock.value.link.type = v
    activeBlock.value.link.url = ''
  }
})

const linkUrl = computed({
  get: () => activeBlock.value?.link?.url ?? '',
  set: (v: string) => {
    if (!activeBlock.value) return
    hs.snapshot()
    ensureLink()
    activeBlock.value.link!.url = v
  }
})
</script>

<template>
  <hr class="my-3" />
  <div class="mb-3">
    <div class="form-check form-switch">
      <input
        id="link-active"
        class="form-check-input"
        type="checkbox"
        role="switch"
        :checked="linkActive"
        @change="linkActive = ($event.target as HTMLInputElement).checked"
      />
      <label class="form-check-label" for="link-active">{{ t('block.link') }}</label>
    </div>
  </div>
  <template v-if="linkActive">
    <div class="mb-3">
      <label class="form-label mb-1">{{ t('block.linkType') }}</label>
      <select class="form-select form-select-sm" v-model="linkType">
        <option value="internal">{{ t('block.linkInternal') }}</option>
        <option value="external">{{ t('block.linkExternal') }}</option>
        <option value="anchor" disabled>{{ t('block.linkAnchor') }}</option>
      </select>
    </div>
    <div v-if="linkType === 'internal'" class="mb-3">
      <label class="form-label mb-1">{{ t('block.linkRoute') }}</label>
      <select
        class="form-select form-select-sm"
        :value="linkUrl"
        @change="linkUrl = ($event.target as HTMLSelectElement).value"
      >
        <option value="" disabled>{{ t('block.linkSelectRoute') }}</option>
        <optgroup v-for="[locale, routes] of routesByLocale" :key="locale" :label="locale.toUpperCase()">
          <option v-for="route in routes" :key="`${locale}-${route.page_id}`" :value="route.path">
            {{ route.path }}
          </option>
        </optgroup>
      </select>
    </div>
    <div v-else class="mb-3">
      <TextField v-model="linkUrl" :label="t('block.linkUrl')" placeholder="https://example.com" />
    </div>
  </template>
</template>
