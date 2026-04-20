import { computed } from 'vue'

const modeKey: Record<ViewportMode, 'd' | 'm' | 't'> = {
  mobile: 'm',
  tablet: 't',
  desktop: 'd'
}

export const useBlockGrid = (block: () => Block) => {
  const vp = viewportStore()
  const st = siteStore()
  const coords = computed(() => block()[modeKey[vp.mode]])

  const backgroundStyle = useBackgroundStyles(
    () => block().style?.background,
    () => (st.site?.options.darkMode ? 'dark' : 'light'),
    () => vp.mode
  )

  const blockStyle = computed(() => {
    const s: Record<string, string> = {
      'grid-column': `${coords.value.x} / span ${coords.value.w}`,
      'grid-row': `${coords.value.y} / span ${coords.value.h}`
    }
    if (backgroundStyle.value.style) {
      backgroundStyle.value.style.split(';').filter(Boolean).forEach(rule => {
        const idx = rule.indexOf(':')
        if (idx !== -1) {
          const prop = rule.slice(0, idx).trim()
          const val = rule.slice(idx + 1).trim()
          if (prop && val) s[prop] = val
        }
      })
    }
    return s
  })

  return { blockStyle, coords, backgroundStyle }
}
