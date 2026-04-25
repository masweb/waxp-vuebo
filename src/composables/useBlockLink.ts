import { useRouter } from 'vue-router'

export const useBlockLink = (block: () => Block) => {
  const router = useRouter()

  const linkConfig = computed(() => block().link)
  const linkUrl = computed(() => block().locales?.linkUrl || '')

  const hasLink = computed(() => !!linkUrl.value)

  const onBlockClick = () => {
    const link = linkConfig.value
    if (!linkUrl.value) return

    if (link.type === 'external') {
      window.open(linkUrl.value, '_blank', 'noopener,noreferrer')
      return
    }

    if (link.type === 'internal') {
      router.push(linkUrl.value)
      return
    }
  }

  const linkTag = computed(() => {
    if (!linkUrl.value) return 'div'
    if (linkConfig.value?.type === 'external') return 'a'
    return 'div'
  })

  const linkAttrs = computed(() => {
    if (!linkUrl.value) return {}

    if (linkConfig.value?.type === 'external') {
      return {
        href: linkUrl.value,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }

    return {}
  })

  return { linkConfig, hasLink, onBlockClick, linkTag, linkAttrs }
}
