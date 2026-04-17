import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import CharacterCount from '@tiptap/extension-character-count'
import Code from '@tiptap/extension-code'
import Color from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import History from '@tiptap/extension-history'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { Editor } from '@tiptap/vue-3'

const syncing = ref(false)

const editor = new Editor({
  content: '',
  extensions: [
    Bold,
    BulletList,
    CharacterCount,
    Code,
    Color,
    Document,
    HardBreak,
    Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    Highlight,
    History,
    HorizontalRule,
    Italic,
    Link.configure({ openOnClick: false }),
    ListItem,
    OrderedList,
    Paragraph,
    Placeholder,
    Strike,
    Text,
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle
  ],
  onUpdate: () => {
    if (syncing.value) return
    flush()
  }
})

const activate = (block: Block) => {
  const pg = pageStore()
  flush()
  historyStore().snapshot()
  pg.setActiveBlock(block)
  syncing.value = true
  editor.commands.setContent(block.content || '')
  syncing.value = false
  nextTick(() => editor.commands.focus())
}

const deactivate = () => {
  const pg = pageStore()
  flush()
  pg.setActiveBlock(null)
  syncing.value = true
  editor.commands.clearContent()
  syncing.value = false
}

const flush = () => {
  const pg = pageStore()
  if (!pg.activeBlock) return
  const html = editor.getHTML()
  if (pg.activeBlock.content !== html) {
    pg.activeBlock.content = html
  }
}

const isActive = (blockId: number) => pageStore().activeBlock?.id === blockId

const onBodyClick = (e: MouseEvent) => {
  const pg = pageStore()
  if (!pg.activeBlock) return
  const t = e.target as HTMLElement
  if (t.closest('.block--active')) return
  if (t.closest('.main-bar')) return
  if (t.closest('.editor-dropdown')) return
  deactivate()
}

if (typeof document !== 'undefined') {
  document.addEventListener('mousedown', onBodyClick)
}

export const useTipTap = () => ({
  editor,
  activate,
  deactivate,
  flush,
  isActive
})
