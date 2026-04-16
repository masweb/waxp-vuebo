<script setup lang="ts">
import { useRouter } from 'vue-router'
import RouterContent from '@/components/editor/RouterContent.vue'
import { IconChevronRight, IconChevronDown, IconPlus, IconPencil, IconTrash, IconExternalLink } from '@tabler/icons-vue'

const props = defineProps<{
  page: Page
  depth?: number
  parentPath?: string
}>()

const emit = defineEmits<{
  edit: [page: Page]
  addChild: [parentId: number]
  delete: [page: Page]
}>()

const expanded = ref(false)
const router = useRouter()
const { locale } = useI18n()

const isRoot = computed(() => props.page.parent_id === null && props.page.slugs.some(s => s.slug === ''))

const displayName = computed(() => {
  if (isRoot.value) {
    const seo = props.page.seo.find(s => s.locale_code === locale.value)
    return seo?.title || '/'
  }
  const seo = props.page.seo.find(s => s.locale_code === locale.value)
  if (seo?.title) return seo.title
  return slug.value || `#${props.page.id}`
})

const slug = computed(() => props.page.slugs.find(s => s.locale_code === locale.value)?.slug ?? '')

const displaySlug = computed(() => (isRoot.value ? '' : slug.value || '—'))

const fullPath = computed(() => {
  const s = slug.value
  const pp = props.parentPath || ''
  if (!pp) return s ? `/${s}` : '/'
  return s ? `${pp}/${s}` : pp
})

const hasChildren = computed(() => props.page.children && props.page.children.length > 0)

const toggle = () => {
  if (hasChildren.value) expanded.value = !expanded.value
}

const navigateToPage = async () => {
  const routeName = `${locale.value}-${props.page.id}`
  if (!router.hasRoute(routeName)) {
    router.addRoute({
      path: fullPath.value,
      name: routeName,
      component: RouterContent,
      props: { pageId: props.page.id, pagePath: fullPath.value, locale: locale.value }
    })
  }
  await router.push({ name: routeName })
}
</script>

<template>
  <div>
    <div
      class="d-flex align-items-center py-1 rounded"
      :style="{ paddingLeft: `${(depth || 0) * 8 + 8}px`, paddingRight: '8px' }"
    >
      <button v-if="hasChildren" class="btn btn-link p-0 me-1 text-secondary" style="min-width: 18px" @click="toggle">
        <IconChevronDown v-if="expanded" :size="16" />
        <IconChevronRight v-else :size="16" />
      </button>
      <span v-else style="min-width: 18px; display: inline-block" class="me-1" />

      <span class="flex-grow-1 text-truncate" style="min-width: 0">
        {{ displayName }}
        <span v-if="!page.published_at" class="badge bg-warning text-dark ms-1" style="font-size: 0.65rem">
          {{ $t('pages.draft') }}
        </span>
      </span>

      <div class="btn-group btn-group-sm ms-auto">
        <button class="btn btn-link p-0 text-secondary" :title="$t('pages.goToPage')" @click="navigateToPage">
          <IconExternalLink :size="16" />
        </button>
        <button
          v-if="!isRoot"
          class="btn btn-link p-0 text-secondary"
          :title="$t('pages.addChild')"
          @click="emit('addChild', page.id)"
        >
          <IconPlus :size="16" />
        </button>
        <button class="btn btn-link p-0 text-secondary" :title="$t('common.edit')" @click="emit('edit', page)">
          <IconPencil :size="16" />
        </button>
        <button
          v-if="!isRoot"
          class="btn btn-link p-0 text-danger"
          :title="$t('common.delete')"
          @click="emit('delete', page)"
        >
          <IconTrash :size="16" />
        </button>
      </div>
    </div>

    <div v-if="expanded && hasChildren">
      <PageTreeNode
        v-for="child in page.children"
        :key="child.id"
        :page="child"
        :depth="(depth || 0) + 1"
        :parent-path="fullPath"
        @edit="emit('edit', $event)"
        @add-child="emit('addChild', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
