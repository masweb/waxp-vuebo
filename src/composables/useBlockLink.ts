import { useRouter } from 'vue-router'

export const useBlockLink = (block: () => Block) => {
  const router = useRouter()

  const linkConfig = computed(() => block().link)

  const hasLink = computed(() => !!linkConfig.value?.url)

  const onBlockClick = () => {
    const link = linkConfig.value
    if (!link?.url) return

    if (link.type === 'external') {
      window.open(link.url, '_blank', 'noopener,noreferrer')
      return
    }

    if (link.type === 'internal') {
      router.push(link.url)
      return
    }
  }

  const linkTag = computed(() => {
    const link = linkConfig.value
    if (!link?.url) return 'div'
    if (link.type === 'external') return 'a'
    return 'div'
  })

  const linkAttrs = computed(() => {
    const link = linkConfig.value
    if (!link?.url) return {}

    if (link.type === 'external') {
      return {
        href: link.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }

    return {}
  })

  return { linkConfig, hasLink, onBlockClick, linkTag, linkAttrs }
}
