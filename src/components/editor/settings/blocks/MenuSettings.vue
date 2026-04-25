<script setup lang="ts">
import type { Font } from '@/types/defaultOptions'
import type { MenuItem, MenuColors, BlockLinkType, MenuItemLink } from '@/types/layout'
import { IconChevronUp, IconChevronDown, IconCirclePlusFilled, IconTrash, IconLink, IconX } from '@tabler/icons-vue'
import ColorPicker from '../fields/ColorPicker.vue'
import NumberRange from '../fields/NumberRange.vue'
import TextField from '../fields/TextField.vue'
import FontFamilyField from '../fields/FontFamilyField.vue'

const pg = pageStore()
const { activeBlock } = storeToRefs(pg)
const hs = historyStore()
const st = siteStore()
const { t } = useI18n()

const menu = computed(() => activeBlock.value?.menu ?? [])

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

const patchMenuColor = (
  field: 'color' | 'hover' | 'active',
  mode: 'light' | 'dark',
  color: string
) => {
  const mc = activeBlock.value?.menuColors
  if (!mc) return
  hs.snapshot()
  mc[field] = { ...mc[field], [mode]: color }
}

const addItem = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  if (!activeBlock.value.menu) activeBlock.value.menu = []
  activeBlock.value.menu.push({ label: '', link: undefined })
}

const addChild = (parent: MenuItem) => {
  hs.snapshot()
  if (!parent.children) parent.children = []
  parent.children.push({ label: '', link: undefined })
}

const removeItem = (list: MenuItem[], index: number) => {
  hs.snapshot()
  list.splice(index, 1)
}

const moveItem = (list: MenuItem[], index: number, direction: -1 | 1) => {
  const target = index + direction
  if (target < 0 || target >= list.length) return
  hs.snapshot()
  const temp = list[index]
  list[index] = list[target]
  list[target] = temp
}

const updateLabel = (item: MenuItem, label: string) => {
  hs.snapshot()
  item.label = label
}

const updateLinkType = (item: MenuItem, type: BlockLinkType) => {
  hs.snapshot()
  if (!item.link) item.link = { type, url: '' }
  else {
    item.link.type = type
    item.link.url = ''
  }
}

const updateLinkUrl = (item: MenuItem, url: string) => {
  hs.snapshot()
  if (!item.link) item.link = { type: 'internal', url }
  else item.link.url = url
}

const toggleLink = (item: MenuItem, active: boolean) => {
  hs.snapshot()
  if (active) item.link = { type: 'internal', url: '' }
  else item.link = undefined
}

const menuFont = computed<Font>({
  get: () => activeBlock.value?.menuFont ?? { family: '', weight: 400, italic: false },
  set: (v: Font) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.menuFont = v
  }
})

const menuSubFont = computed<Font>({
  get: () => activeBlock.value?.menuSubFont ?? { family: '', weight: 400, italic: false },
  set: (v: Font) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.menuSubFont = v
  }
})

const hasMenuFontSize = computed(() => activeBlock.value?.menuFontSize != null)
const hasMenuLineHeight = computed(() => activeBlock.value?.menuLineHeight != null)
const hasMenuSubFontSize = computed(() => activeBlock.value?.menuSubFontSize != null)
const hasMenuSubLineHeight = computed(() => activeBlock.value?.menuSubLineHeight != null)

const menuFontSize = computed({
  get: () => activeBlock.value?.menuFontSize ?? st.site?.options.fontSize ?? 1,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.menuFontSize = v
  }
})

const menuLineHeight = computed({
  get: () => activeBlock.value?.menuLineHeight ?? st.site?.options.lineHeight ?? 1.4,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.menuLineHeight = v
  }
})

const menuSubFontSize = computed({
  get: () => activeBlock.value?.menuSubFontSize ?? st.site?.options.fontSize ?? 1,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.menuSubFontSize = v
  }
})

const menuSubLineHeight = computed({
  get: () => activeBlock.value?.menuSubLineHeight ?? st.site?.options.lineHeight ?? 1.4,
  set: (v: number) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.menuSubLineHeight = v
  }
})

const resetMenuFontSize = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.menuFontSize = null
}

const resetMenuLineHeight = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.menuLineHeight = null
}

const resetMenuSubFontSize = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.menuSubFontSize = null
}

const resetMenuSubLineHeight = () => {
  if (!activeBlock.value) return
  hs.snapshot()
  activeBlock.value.menuSubLineHeight = null
}

const isMobileMenu = computed({
  get: () => !!activeBlock.value?.isMobileMenu,
  set: (v: boolean) => {
    if (!activeBlock.value) return
    hs.snapshot()
    activeBlock.value.isMobileMenu = v
  }
})
</script>

<template>
  <hr class="my-3" />

  <div class="mb-3">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <label class="form-label fw-semibold mb-0">{{ t('block.menuItems') }}</label>
      <button class="btn btn-sm btn-link py-0 px-2" @click="addItem">
        <IconCirclePlusFilled :size="14" /> {{ t('common.add') }}
      </button>
    </div>

    <div v-for="(item, idx) in menu" :key="idx" class="menu-settings__item mb-2 border rounded p-2">
      <div class="d-flex align-items-center gap-1 mb-1">
        <button
          class="btn btn-sm btn-link p-0 text-secondary"
          :disabled="idx === 0"
          @click="moveItem(menu, idx, -1)"
        >
          <IconChevronUp :size="14" />
        </button>
        <button
          class="btn btn-sm btn-link p-0 text-secondary"
          :disabled="idx === menu.length - 1"
          @click="moveItem(menu, idx, 1)"
        >
          <IconChevronDown :size="14" />
        </button>
        <div class="flex-grow-1">
          <input
            class="form-control form-control-sm"
            :value="item.label"
            :placeholder="t('block.menuItemLabel')"
            @input="updateLabel(item, ($event.target as HTMLInputElement).value)"
          />
        </div>
        <button class="btn btn-sm btn-link p-0" @click="addChild(item)">
          <IconCirclePlusFilled :size="14" />
        </button>
        <button class="btn btn-sm btn-link p-0 text-danger" @click="removeItem(menu, idx)">
          <IconTrash :size="14" />
        </button>
      </div>

      <div class="ms-4 mb-1">
        <template v-if="item.link">
          <div v-if="item.link.type === 'internal'" class="mb-1">
            <select
              class="form-select form-select-sm"
              :value="item.link.url"
              @change="updateLinkUrl(item, ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled>{{ t('block.linkSelectRoute') }}</option>
              <optgroup
                v-for="[locale, routes] of routesByLocale"
                :key="locale"
                :label="locale.toUpperCase()"
              >
                <option v-for="route in routes" :key="`${locale}-${route.page_id}`" :value="route.path">
                  {{ route.path }}
                </option>
              </optgroup>
            </select>
          </div>
          <div v-else class="mb-1">
            <input
              class="form-control form-control-sm"
              :value="item.link.url"
              placeholder="https://example.com"
              @input="updateLinkUrl(item, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </template>
        <div class="d-flex align-items-center justify-content-between">
          <div class="form-check form-switch mb-0">
            <input
              :id="`menu-link-${idx}`"
              class="form-check-input"
              type="checkbox"
              role="switch"
              :checked="!!item.link"
              @change="toggleLink(item, ($event.target as HTMLInputElement).checked)"
            />
            <label class="form-check-label small" :for="`menu-link-${idx}`">
              <IconLink :size="12" /> {{ t('block.link') }}
            </label>
          </div>
          <div v-if="item.link" class="btn-group btn-group-sm" role="group">
            <button
              type="button"
              class="btn btn-outline-secondary py-0 px-2"
              :class="{ active: item.link.type === 'internal' }"
              :title="t('block.linkInternal')"
              @click="updateLinkType(item, 'internal')"
            >I</button>
            <button
              type="button"
              class="btn btn-outline-secondary py-0 px-2"
              :class="{ active: item.link.type === 'external' }"
              :title="t('block.linkExternal')"
              @click="updateLinkType(item, 'external')"
            >E</button>
            <button
              type="button"
              class="btn btn-outline-secondary py-0 px-2 disabled"
              :title="t('block.linkAnchor')"
              disabled
            >A</button>
          </div>
        </div>
      </div>

      <div v-if="item.children?.length" class="menu-settings__children ms-4 border-start ps-2">
        <div v-for="(child, cIdx) in item.children" :key="cIdx" class="mb-2">
          <div class="d-flex align-items-center gap-1 mb-1">
            <button
              class="btn btn-sm btn-link p-0 text-secondary"
              :disabled="cIdx === 0"
              @click="moveItem(item.children!, cIdx, -1)"
            >
              <IconChevronUp :size="12" />
            </button>
            <button
              class="btn btn-sm btn-link p-0 text-secondary"
              :disabled="cIdx === item.children!.length - 1"
              @click="moveItem(item.children!, cIdx, 1)"
            >
              <IconChevronDown :size="12" />
            </button>
            <div class="flex-grow-1">
              <input
                class="form-control form-control-sm"
                :value="child.label"
                :placeholder="t('block.menuItemLabel')"
                @input="updateLabel(child, ($event.target as HTMLInputElement).value)"
              />
            </div>
            <button class="btn btn-sm btn-link p-0 text-danger" @click="removeItem(item.children!, cIdx)">
              <IconTrash :size="12" />
            </button>
          </div>
          <div class="ms-3">
            <template v-if="child.link">
              <div v-if="child.link.type === 'internal'" class="mb-1">
                <select
                  class="form-select form-select-sm"
                  :value="child.link.url"
                  @change="updateLinkUrl(child, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="" disabled>{{ t('block.linkSelectRoute') }}</option>
                  <optgroup
                    v-for="[locale, routes] of routesByLocale"
                    :key="locale"
                    :label="locale.toUpperCase()"
                  >
                    <option v-for="route in routes" :key="`${locale}-${route.page_id}`" :value="route.path">
                      {{ route.path }}
                    </option>
                  </optgroup>
                </select>
              </div>
              <div v-else class="mb-1">
                <input
                  class="form-control form-control-sm"
                  :value="child.link.url"
                  placeholder="https://example.com"
                  @input="updateLinkUrl(child, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </template>
            <div class="d-flex align-items-center justify-content-between">
              <div class="form-check form-switch mb-0">
                <input
                  :id="`menu-link-${idx}-${cIdx}`"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :checked="!!child.link"
                  @change="toggleLink(child, ($event.target as HTMLInputElement).checked)"
                />
                <label class="form-check-label small" :for="`menu-link-${idx}-${cIdx}`">
                  <IconLink :size="12" /> {{ t('block.link') }}
                </label>
              </div>
              <div v-if="child.link" class="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  class="btn btn-outline-secondary py-0 px-2"
                  :class="{ active: child.link.type === 'internal' }"
                  :title="t('block.linkInternal')"
                  @click="updateLinkType(child, 'internal')"
                >I</button>
                <button
                  type="button"
                  class="btn btn-outline-secondary py-0 px-2"
                  :class="{ active: child.link.type === 'external' }"
                  :title="t('block.linkExternal')"
                  @click="updateLinkType(child, 'external')"
                >E</button>
                <button
                  type="button"
                  class="btn btn-outline-secondary py-0 px-2 disabled"
                  :title="t('block.linkAnchor')"
                  disabled
                >A</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!menu.length" class="text-secondary small">{{ t('block.menuEmpty') }}</div>
  </div>

  <hr class="my-3" />

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.menuColor') }}</label>
    <div class="row g-2">
      <div class="col-6 d-flex justify-content-start align-items-baseline gap-3">
        <ColorPicker :color="activeBlock?.menuColors?.color?.light ?? ''" @update:color="patchMenuColor('color', 'light', $event)" />
        <label>{{ t('block.light') }}</label>
      </div>
      <div class="col-6 d-flex justify-content-start align-items-baseline gap-3">
        <ColorPicker :color="activeBlock?.menuColors?.color?.dark ?? ''" @update:color="patchMenuColor('color', 'dark', $event)" />
        <label>{{ t('block.dark') }}</label>
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.menuHover') }}</label>
    <div class="row g-2">
      <div class="col-6 d-flex justify-content-start align-items-baseline gap-3">
        <ColorPicker :color="activeBlock?.menuColors?.hover?.light ?? ''" @update:color="patchMenuColor('hover', 'light', $event)" />
        <label>{{ t('block.light') }}</label>
      </div>
      <div class="col-6 d-flex justify-content-start align-items-baseline gap-3">
        <ColorPicker :color="activeBlock?.menuColors?.hover?.dark ?? ''" @update:color="patchMenuColor('hover', 'dark', $event)" />
        <label>{{ t('block.dark') }}</label>
      </div>
    </div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold mb-1">{{ t('block.menuActive') }}</label>
    <div class="row g-2">
      <div class="col-6 d-flex justify-content-start align-items-baseline gap-3">
        <ColorPicker :color="activeBlock?.menuColors?.active?.light ?? ''" @update:color="patchMenuColor('active', 'light', $event)" />
        <label>{{ t('block.light') }}</label>
      </div>
      <div class="col-6 d-flex justify-content-start align-items-baseline gap-3">
        <ColorPicker :color="activeBlock?.menuColors?.active?.dark ?? ''" @update:color="patchMenuColor('active', 'dark', $event)" />
        <label>{{ t('block.dark') }}</label>
      </div>
    </div>
  </div>

  <hr class="my-3" />

  <div class="mb-3">
    <label class="form-label fw-semibold">{{ t('block.menuLevel1') }}</label>
    <FontFamilyField v-model="menuFont" :label="t('block.menuFont')" />
    <div class="mb-2">
      <div class="d-flex align-items-center justify-content-between mb-1">
        <label class="form-label mb-0">{{ t('block.fontSize') }}</label>
        <span v-if="!hasMenuFontSize" class="badge text-bg-secondary">{{ t('block.inherited') }}</span>
        <button v-else class="btn btn-sm btn-link p-0 text-secondary" @click="resetMenuFontSize">
          <IconX :size="14" />
        </button>
      </div>
      <NumberRange v-model="menuFontSize" :min="0.1" :max="5" :step="0.1" />
    </div>
    <div class="mb-2">
      <div class="d-flex align-items-center justify-content-between mb-1">
        <label class="form-label mb-0">{{ t('block.lineHeight') }}</label>
        <span v-if="!hasMenuLineHeight" class="badge text-bg-secondary">{{ t('block.inherited') }}</span>
        <button v-else class="btn btn-sm btn-link p-0 text-secondary" @click="resetMenuLineHeight">
          <IconX :size="14" />
        </button>
      </div>
      <NumberRange v-model="menuLineHeight" :min="0.1" :max="5" :step="0.1" />
    </div>
  </div>

  <hr class="my-3" />

  <div class="mb-3">
    <label class="form-label fw-semibold">{{ t('block.menuSubLevels') }}</label>
    <FontFamilyField v-model="menuSubFont" :label="t('block.menuFont')" />
    <div class="mb-2">
      <div class="d-flex align-items-center justify-content-between mb-1">
        <label class="form-label mb-0">{{ t('block.fontSize') }}</label>
        <span v-if="!hasMenuSubFontSize" class="badge text-bg-secondary">{{ t('block.inherited') }}</span>
        <button v-else class="btn btn-sm btn-link p-0 text-secondary" @click="resetMenuSubFontSize">
          <IconX :size="14" />
        </button>
      </div>
      <NumberRange v-model="menuSubFontSize" :min="0.1" :max="5" :step="0.1" />
    </div>
    <div class="mb-2">
      <div class="d-flex align-items-center justify-content-between mb-1">
        <label class="form-label mb-0">{{ t('block.lineHeight') }}</label>
        <span v-if="!hasMenuSubLineHeight" class="badge text-bg-secondary">{{ t('block.inherited') }}</span>
        <button v-else class="btn btn-sm btn-link p-0 text-secondary" @click="resetMenuSubLineHeight">
          <IconX :size="14" />
        </button>
      </div>
      <NumberRange v-model="menuSubLineHeight" :min="0.1" :max="5" :step="0.1" />
    </div>
  </div>

  <hr class="my-3" />

  <div class="mb-3">
    <div class="form-check form-switch">
      <input
        id="menu-mobile"
        class="form-check-input"
        type="checkbox"
        role="switch"
        :checked="isMobileMenu"
        @change="isMobileMenu = ($event.target as HTMLInputElement).checked"
      />
      <label class="form-check-label" for="menu-mobile">{{ t('block.menuMobile') }}</label>
      <div class="form-text">{{ t('block.menuMobileHint') }}</div>
    </div>
  </div>
</template>
