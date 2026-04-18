<script setup lang="ts">
import {
  IconPower,
  IconSettingsFilled,
  IconLayoutDashboardFilled,
  IconFileFilled,
  IconFrame,
  IconSitemapFilled,
  IconSunHighFilled,
  IconMoonFilled,
  IconLayoutGridFilled,
  IconDeviceDesktopFilled,
  IconDeviceMobileFilled,
  IconDeviceTabletFilled,
  IconDeviceFloppyFilled,
  IconArrowBackUp,
  IconArrowForward,
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconHeading,
  IconItalic,
  IconLink,
  IconLinkOff,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPalette,
  IconStrikethrough,
  IconUnderline,
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconHighlight,
  IconX,
  IconWorldFilled
} from '@tabler/icons-vue'

const auth = useAuthStore()
const nav = navigationStore()
const st = siteStore()
const stt = settingsStore()
const pg = pageStore()
const hs = historyStore()

const { site } = storeToRefs(st)
const { canUndo, canRedo } = storeToRefs(hs)

const vp = viewportStore()
const toggleGridVisibility = () => (vp.showGrids = !vp.showGrids)

const viewportModes: { mode: ViewportMode; icon: any }[] = [
  { mode: 'mobile', icon: IconDeviceMobileFilled },
  { mode: 'tablet', icon: IconDeviceTabletFilled },
  { mode: 'desktop', icon: IconDeviceDesktopFilled }
]

const toggleViewportMode = (mode: ViewportMode) => {
  vp.forcedMode = vp.forcedMode === mode ? null : mode
}

const toggleSiteDarkMode = () => {
  if (!site.value?.options) return
  site.value.options.darkMode = !site.value.options.darkMode
}

const backToDashboard = () => {
  st.closeSite()
  nav.setView('dashboard')
}

const onKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault()
    e.shiftKey ? hs.redo() : hs.undo()
  }
}

const updateAll = () => {
  pg.updatePage()
  st.updateSite()
}

// ── TipTap toolbar ────────────────────────────────────────────────────────────

const { editor } = useTipTap()
const { t } = useI18n()

const headingOpen = ref(false)
const headingBtn = ref<HTMLElement | null>(null)
const headingMenuStyle = ref<Record<string, string>>({})

const toggleHeadingDropdown = () => {
  if (!headingOpen.value && headingBtn.value) {
    const r = headingBtn.value.getBoundingClientRect()
    headingMenuStyle.value = { position: 'fixed', top: `${r.bottom + 4}px`, left: `${r.left}px`, zIndex: '9999' }
  }
  headingOpen.value = !headingOpen.value
}

const pickHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
  editor.chain().focus().toggleHeading({ level }).run()
  headingOpen.value = false
}

const alignOpen = ref(false)
const alignBtn = ref<HTMLElement | null>(null)
const alignMenuStyle = ref<Record<string, string>>({})

const toggleAlignDropdown = () => {
  if (!alignOpen.value && alignBtn.value) {
    const r = alignBtn.value.getBoundingClientRect()
    alignMenuStyle.value = { position: 'fixed', top: `${r.bottom + 4}px`, left: `${r.left}px`, zIndex: '9999' }
  }
  alignOpen.value = !alignOpen.value
}

const pickAlign = (align: string) => {
  editor.chain().focus().setTextAlign(align).run()
  alignOpen.value = false
}

const listsOpen = ref(false)
const listsBtn = ref<HTMLElement | null>(null)
const listsMenuStyle = ref<Record<string, string>>({})

const toggleListsDropdown = () => {
  if (!listsOpen.value && listsBtn.value) {
    const r = listsBtn.value.getBoundingClientRect()
    listsMenuStyle.value = { position: 'fixed', top: `${r.bottom + 4}px`, left: `${r.left}px`, zIndex: '9999' }
  }
  listsOpen.value = !listsOpen.value
}

const colorOpen = ref(false)
const colorBtn = ref<HTMLElement | null>(null)
const colorMenuStyle = ref<Record<string, string>>({})

const COLORS = [
  '#000000',
  '#374151',
  '#6b7280',
  '#9ca3af',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#14b8a6',
  '#84cc16',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#2563eb'
]

const toggleColorPicker = () => {
  if (!colorOpen.value && colorBtn.value) {
    const r = colorBtn.value.getBoundingClientRect()
    colorMenuStyle.value = { position: 'fixed', top: `${r.bottom + 4}px`, left: `${r.left}px`, zIndex: '9999' }
  }
  colorOpen.value = !colorOpen.value
}

const pickColor = (color: string) => {
  editor.chain().focus().setColor(color).run()
  colorOpen.value = false
}

const clearColor = () => {
  editor.chain().focus().unsetColor().run()
  colorOpen.value = false
}

const linkOpen = ref(false)
const linkInput = ref<HTMLInputElement | null>(null)
const linkUrl = ref('')
const linkBtn = ref<HTMLElement | null>(null)
const linkPopover = ref<HTMLElement | null>(null)
const linkMenuStyle = ref<Record<string, string>>({})
let savedLinkRange: { from: number; to: number } | null = null

const openLinkModal = () => {
  const { from, to } = editor.state.selection
  savedLinkRange = { from, to }
  linkUrl.value = editor.getAttributes('link').href ?? ''
  if (linkBtn.value) {
    const r = linkBtn.value.getBoundingClientRect()
    linkMenuStyle.value = { position: 'fixed', top: `${r.bottom + 4}px`, left: `${r.left}px`, zIndex: '9999' }
  }
  linkOpen.value = true
  nextTick(() => {
    linkInput.value?.focus()
    linkInput.value?.select()
  })
}

const applyLink = () => {
  const url = linkUrl.value.trim()
  if (!url || !savedLinkRange) return
  const { from, to } = savedLinkRange
  savedLinkRange = null
  linkOpen.value = false
  const { state, dispatch } = editor.view
  const markType = state.schema.marks['link']
  if (!markType) return
  const { tr } = state
  tr.addMark(from, to, markType.create({ href: url }))
  dispatch(tr)
  editor.commands.focus()
}

const removeLink = () => editor.chain().focus().unsetLink().run()

const onDocClick = (e: MouseEvent) => {
  const t = e.target as Node
  if (!headingBtn.value?.contains(t)) headingOpen.value = false
  if (!listsBtn.value?.contains(t)) listsOpen.value = false
  if (!alignBtn.value?.contains(t)) alignOpen.value = false
  if (!colorBtn.value?.contains(t)) colorOpen.value = false
  if (!linkBtn.value?.contains(t) && !linkPopover.value?.contains(t)) linkOpen.value = false
}

const closeEditor = () => {
  const { deactivate } = useTipTap()
  deactivate()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div v-if="auth.isAuthenticated" class="main-bar d-flex">
    <div class="d-flex align-items-center">
      <button @click="backToDashboard()" class="btn btn-sm btn-link">
        <IconLayoutDashboardFilled :size="24" />
      </button>
      <button v-if="!site?.options" @click="nav.main = 'settings'" class="btn btn-sm btn-link">
        <IconSettingsFilled :size="24" />
      </button>
      <template v-if="site?.options">
        <button @click="stt.setSetting('SiteSettings')" class="btn btn-sm btn-link">
          <IconWorldFilled :size="24" />
        </button>
        <button @click="stt.setSetting('RoutingSettings')" class="btn btn-sm btn-link">
          <IconSitemapFilled :size="24" />
        </button>
        <button @click="toggleSiteDarkMode" class="btn btn-sm btn-link">
          <IconSunHighFilled v-if="site.options.darkMode" :size="24" />
          <IconMoonFilled v-else :size="24" />
        </button>
        <button @click="toggleGridVisibility" class="btn btn-sm btn-link" :class="{ active: vp.showGrids }">
          <IconLayoutGridFilled :size="24" />
        </button>
        <div class="d-flex align-items-center ms-1 border-start ps-1">
          <button
            v-for="vm in viewportModes"
            :key="vm.mode"
            @click="toggleViewportMode(vm.mode)"
            class="btn btn-sm btn-link"
            :class="{ active: vp.forcedMode === vm.mode }"
          >
            <component :is="vm.icon" :size="20" />
          </button>
        </div>
      </template>
    </div>

    <!-- Center: toolbar or errors -->
    <div v-if="pg.activeBlock" class="d-flex align-items-center">
      <div class="d-flex">
        <button
          type="button"
          class="btn btn-sm btn-link"
          :title="t('editor.toolbar.undo')"
          :disabled="!editor.can().undo()"
          @click="editor.chain().focus().undo().run()"
        >
          <IconArrowBackUp :size="20" stroke-width="1.2" />
        </button>
        <button
          type="button"
          class="btn btn-sm btn-link"
          :title="t('editor.toolbar.redo')"
          :disabled="!editor.can().redo()"
          @click="editor.chain().focus().redo().run()"
        >
          <IconArrowForward :size="20" stroke-width="1.2" />
        </button>
      </div>
      <div class="d-flex">
        <button
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <IconBold :size="20" stroke-width="1.2" />
        </button>
        <button
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <IconItalic :size="20" stroke-width="1.2" />
        </button>
        <button
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <IconStrikethrough :size="20" stroke-width="1.2" />
        </button>
        <button
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <IconUnderline :size="20" stroke-width="1.2" />
        </button>
        <button
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('code') }"
          @click="editor.chain().focus().toggleCode().run()"
        >
          <IconCode :size="20" stroke-width="1.2" />
        </button>
      </div>
      <div class="d-flex">
        <button
          ref="headingBtn"
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('heading') }"
          @click.stop="toggleHeadingDropdown"
        >
          <IconHeading :size="20" stroke-width="1.2" /><span class="toolbar-caret">▼</span>
        </button>
      </div>
      <div class="d-flex">
        <button
          ref="alignBtn"
          type="button"
          class="btn btn-sm btn-link"
          :class="{
            active:
              editor.isActive({ textAlign: 'center' }) ||
              editor.isActive({ textAlign: 'right' }) ||
              editor.isActive({ textAlign: 'justify' })
          }"
          @click.stop="toggleAlignDropdown"
        >
          <component
            :is="
              editor.isActive({ textAlign: 'center' })
                ? IconAlignCenter
                : editor.isActive({ textAlign: 'right' })
                  ? IconAlignRight
                  : editor.isActive({ textAlign: 'justify' })
                    ? IconAlignJustified
                    : IconAlignLeft
            "
            :size="20"
            stroke-width="1.2"
          />
          <span class="toolbar-caret">▼</span>
        </button>
      </div>
      <div class="d-flex">
        <button
          ref="listsBtn"
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('bulletList') || editor.isActive('orderedList') }"
          @click.stop="toggleListsDropdown"
        >
          <component :is="editor.isActive('orderedList') ? IconListNumbers : IconList" :size="20" stroke-width="1.2" />
          <span class="toolbar-caret">▼</span>
        </button>
      </div>
      <button
        type="button"
        class="btn btn-sm btn-link"
        :class="{ active: editor.isActive('highlight') }"
        @click="editor.chain().focus().toggleHighlight().run()"
      >
        <IconHighlight :size="20" stroke-width="1.2" />
      </button>
      <button type="button" class="btn btn-sm btn-link" @click="editor.chain().focus().setHorizontalRule().run()">
        <IconMinus :size="20" stroke-width="1.2" />
      </button>
      <div class="d-flex">
        <button
          ref="linkBtn"
          type="button"
          class="btn btn-sm btn-link"
          :class="{ active: editor.isActive('link') }"
          @click.stop="openLinkModal"
        >
          <IconLink :size="20" stroke-width="1.2" />
        </button>
        <button type="button" class="btn btn-sm btn-link" :disabled="!editor.isActive('link')" @click="removeLink">
          <IconLinkOff :size="20" stroke-width="1.2" />
        </button>
      </div>
      <button ref="colorBtn" type="button" class="btn btn-sm btn-link" @click.stop="toggleColorPicker">
        <IconPalette :size="20" stroke-width="1.2" :style="{ color: editor.getAttributes('textStyle').color }" />
      </button>
      <button type="button" class="btn btn-sm btn-link" @click="closeEditor">
        <IconX :size="18" stroke-width="1.5" />
      </button>
    </div>
    <ErrorsNotifier v-else />

    <!-- Dropdowns -->
    <Teleport to="body">
      <div v-if="headingOpen" :style="headingMenuStyle" class="editor-dropdown border rounded shadow-sm bg-body p-1">
        <button
          v-for="lvl in [1, 2, 3, 4, 5, 6]"
          :key="lvl"
          type="button"
          class="btn btn-sm w-100 text-start"
          :class="{ active: editor.isActive('heading', { level: lvl }) }"
          @click="pickHeading(lvl as 1 | 2 | 3 | 4 | 5 | 6)"
        >
          <component :is="[IconH1, IconH2, IconH3, IconH4, IconH5, IconH6][lvl - 1]" :size="20" stroke-width="1.2" />
        </button>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="alignOpen" :style="alignMenuStyle" class="editor-dropdown border rounded shadow-sm bg-body p-1">
        <button
          type="button"
          class="btn btn-sm w-100 text-start d-flex align-items-center gap-2"
          :class="{ active: editor.isActive({ textAlign: 'left' }) }"
          @click="pickAlign('left')"
        >
          <IconAlignLeft :size="20" stroke-width="1.2" /> {{ t('editor.align.left') }}
        </button>
        <button
          type="button"
          class="btn btn-sm w-100 text-start d-flex align-items-center gap-2"
          :class="{ active: editor.isActive({ textAlign: 'center' }) }"
          @click="pickAlign('center')"
        >
          <IconAlignCenter :size="20" stroke-width="1.2" /> {{ t('editor.align.center') }}
        </button>
        <button
          type="button"
          class="btn btn-sm w-100 text-start d-flex align-items-center gap-2"
          :class="{ active: editor.isActive({ textAlign: 'right' }) }"
          @click="pickAlign('right')"
        >
          <IconAlignRight :size="20" stroke-width="1.2" /> {{ t('editor.align.right') }}
        </button>
        <button
          type="button"
          class="btn btn-sm w-100 text-start d-flex align-items-center gap-2"
          :class="{ active: editor.isActive({ textAlign: 'justify' }) }"
          @click="pickAlign('justify')"
        >
          <IconAlignJustified :size="20" stroke-width="1.2" /> {{ t('editor.align.justify') }}
        </button>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
        v-if="listsOpen"
        :style="listsMenuStyle"
        class="editor-dropdown border rounded shadow-sm bg-body p-1"
        style="min-width: 160px"
      >
        <button
          type="button"
          class="btn btn-sm w-100 text-start d-flex align-items-center gap-2"
          :class="{ active: editor.isActive('bulletList') }"
          @click="(editor.chain().focus().toggleBulletList().run(), (listsOpen = false))"
        >
          <IconList :size="20" stroke-width="1.2" /> {{ t('editor.list.bullet') }}
        </button>
        <button
          type="button"
          class="btn btn-sm w-100 text-start d-flex align-items-center gap-2"
          :class="{ active: editor.isActive('orderedList') }"
          @click="(editor.chain().focus().toggleOrderedList().run(), (listsOpen = false))"
        >
          <IconListNumbers :size="20" stroke-width="1.2" /> {{ t('editor.list.ordered') }}
        </button>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
        v-if="linkOpen"
        ref="linkPopover"
        :style="linkMenuStyle"
        class="editor-dropdown border rounded shadow-sm bg-body p-2"
      >
        <form class="d-flex gap-1" @submit.prevent="applyLink">
          <input
            ref="linkInput"
            v-model="linkUrl"
            type="text"
            class="form-control form-control-sm"
            placeholder="https://..."
            style="min-width: 220px"
          />
          <button type="submit" class="btn btn-sm btn-primary">OK</button>
        </form>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="colorOpen" :style="colorMenuStyle" class="editor-dropdown border rounded shadow-sm bg-body p-2">
        <div class="d-flex flex-wrap gap-1" style="width: 134px">
          <button
            v-for="c in COLORS"
            :key="c"
            type="button"
            class="color-swatch"
            :style="{
              background: c,
              outline:
                editor.getAttributes('textStyle').color === c
                  ? '2px solid var(--bs-primary)'
                  : '1px solid var(--bs-border-color)'
            }"
            @click="pickColor(c)"
          />
        </div>
        <button type="button" class="btn btn-sm btn-link px-0 mt-1 text-secondary small" @click="clearColor">
          {{ t('editor.color.none') }}
        </button>
      </div>
    </Teleport>

    <!-- Right -->
    <div class="d-flex align-items-center">
      <template v-if="site?.options">
        <button class="btn btn-sm btn-link pe-3" :disabled="!canUndo" @click="hs.undo()">
          <IconArrowBackUp :size="24" stroke-width="2.2" />
        </button>
        <button class="btn btn-sm btn-link pe-3" :disabled="!canRedo" @click="hs.redo()">
          <IconArrowForward :size="24" stroke-width="2.2" />
        </button>
        <button @click="updateAll()" class="btn btn-sm btn-link pe-3" :disabled="!canUndo">
          <IconDeviceFloppyFilled :size="24" stroke-width="2.2" />
        </button>
      </template>
      <button @click="auth.logout()" class="btn btn-sm btn-link pe-3">
        <IconPower :size="24" stroke-width="2.2" />
      </button>
    </div>
  </div>
</template>
