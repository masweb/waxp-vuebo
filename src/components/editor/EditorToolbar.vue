<script setup lang="ts">
import {
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
  IconStrikethrough,
  IconUnderline,
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconHighlight,
  IconX
} from '@tabler/icons-vue'

const pg = pageStore()

const { editor, editing: ttEditing } = useTipTap()
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
const currentColor = computed(() => editor.getAttributes('textStyle').color || '')

const onPickerColor = (color: string) => {
  editor.chain().focus().setColor(color).run()
}

const linkOpen = ref(false)
const linkInput = ref<HTMLInputElement | null>(null)
const linkUrl = ref('')
const linkBtn = ref<HTMLElement | null>(null)
const linkPopover = ref<HTMLElement | null>(null)
const linkMenuStyle = ref<Record<string, string>>({})
let savedLinkRange: { from: number; to: number } | null = null

const st = siteStore()

const linkMode = ref<'internal' | 'external'>('external')

const routesByLocale = computed(() => {
  const routes = st.site?.routes
  if (!routes) return new Map<string, { path: string; page_id: number }[]>()
  const map = new Map<string, { path: string; page_id: number }[]>()
  for (const [locale, localeRoutes] of Object.entries(routes)) {
    map.set(locale, localeRoutes.map(r => ({ path: r.path, page_id: r.page_id })))
  }
  return map
})

const openLinkModal = () => {
  const { from, to } = editor.state.selection
  savedLinkRange = { from, to }
  const href = editor.getAttributes('link').href ?? ''
  linkUrl.value = href
  linkMode.value = href.startsWith('/') ? 'internal' : 'external'
  if (linkBtn.value) {
    const r = linkBtn.value.getBoundingClientRect()
    linkMenuStyle.value = { position: 'fixed', top: `${r.bottom + 4}px`, left: `${r.left}px`, zIndex: '9999' }
  }
  linkOpen.value = true
  nextTick(() => {
    if (linkMode.value === 'external') {
      linkInput.value?.focus()
      linkInput.value?.select()
    }
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
  const { stopEditing } = useTipTap()
  stopEditing()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div v-if="pg.activeBlock && ttEditing" class="d-flex align-items-center">
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
    <ColorPicker :color="currentColor" @update:color="onPickerColor" />
    <button type="button" class="btn btn-sm btn-link" @click="closeEditor">
      <IconX :size="18" stroke-width="1.5" />
    </button>
  </div>

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
      style="min-width: 260px"
    >
      <div class="btn-group btn-group-sm w-100 mb-2">
        <button
          type="button"
          class="btn"
          :class="linkMode === 'internal' ? 'btn-primary' : 'btn-outline-primary'"
          @click="linkMode = 'internal'"
        >
          {{ t('block.linkInternal') }}
        </button>
        <button
          type="button"
          class="btn"
          :class="linkMode === 'external' ? 'btn-primary' : 'btn-outline-primary'"
          @click="linkMode = 'external'"
        >
          {{ t('block.linkExternal') }}
        </button>
      </div>
      <template v-if="linkMode === 'internal'">
        <select
          class="form-select form-select-sm mb-2"
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
        <button
          type="button"
          class="btn btn-sm btn-primary w-100"
          :disabled="!linkUrl"
          @click="applyLink"
        >
          OK
        </button>
      </template>
      <form v-else class="d-flex gap-1" @submit.prevent="applyLink">
        <input
          ref="linkInput"
          v-model="linkUrl"
          type="text"
          class="form-control form-control-sm"
          placeholder="https://..."
          style="min-width: 180px"
        />
        <button type="submit" class="btn btn-sm btn-primary">OK</button>
      </form>
    </div>
  </Teleport>
</template>
