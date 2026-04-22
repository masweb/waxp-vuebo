import { computed } from 'vue'

const modeKey: Record<ViewportMode, 'd' | 'm' | 't'> = {
  mobile: 'm',
  tablet: 't',
  desktop: 'd'
}

export const useBlockGrid = (block: () => Block, section?: () => Section) => {
  const vp = viewportStore()
  const st = siteStore()
  const coords = computed(() => block()[modeKey[vp.mode]])

  const backgroundStyle = useBackgroundStyles(
    () => block().style?.background,
    () => (st.site?.options.darkMode ? 'dark' : 'light'),
    () => vp.mode
  )

  const isDark = computed(() => !!st.site?.options.darkMode)

  const sectionTargetWidth = computed(() => {
    if (!section) return undefined
    return section().style.maxWidth ?? st.site?.options.desktopWidth ?? undefined
  })

  const toPx = (base: number, vwAdd: number, width: number) =>
    (base + vwAdd) * width / 100 + 'px'

  const blockFontStyle = computed(() => {
    const b = block()
    if (b.fontSize == null && b.lineHeight == null) return null
    const opts = st.site?.options
    if (!opts) return null
    const tw = sectionTargetWidth.value
    if (tw == null) return null

    const fs = b.fontSize ?? opts.fontSize
    const lh = b.lineHeight ?? opts.lineHeight
    const fw = section?.().style.fullWidth ?? false

    let finalFontSize: string | number = fs
    let finalLineHeight: string | number = lh

    if (fw && vp.mode === 'desktop') {
      const factor = 1.491 - 0.000965 * tw
      finalFontSize = toPx(fs, factor, vp.width)
      finalLineHeight = parseFloat(finalFontSize) * lh + 'px'
    } else if (vp.mode === 'desktop' && (vp.forcedMode === 'desktop' || (!vp.forcedMode && tw >= vp.width))) {
      const factor = 1.491 - 0.000965 * tw
      const effectiveWidth = vp.forcedMode ? tw : vp.width
      finalFontSize = toPx(fs, factor, effectiveWidth)
      finalLineHeight = parseFloat(finalFontSize) * lh + 'px'
    } else if (vp.mode === 'tablet' || vp.forcedMode === 'tablet') {
      const effectiveWidth = vp.forcedMode ? 820 : vp.width
      finalFontSize = toPx(fs, 0.933, effectiveWidth)
      finalLineHeight = parseFloat(finalFontSize) * lh + 'px'
    } else if (vp.mode === 'mobile' || vp.forcedMode === 'mobile') {
      const effectiveWidth = vp.forcedMode ? 480 : vp.width
      finalFontSize = toPx(fs, 3, effectiveWidth)
      finalLineHeight = parseFloat(finalFontSize) * lh + 'px'
    } else {
      finalFontSize = fs + 'em'
      finalLineHeight = lh + 'em'
    }

    const s: Record<string, string> = {}
    if (b.fontSize != null) s['font-size'] = String(finalFontSize)
    if (b.lineHeight != null) s['line-height'] = String(finalLineHeight)
    return s
  })

  const textStyle = computed(() => {
    const b = block()
    const s: Record<string, string> = {}
    const color = isDark.value ? b.darkColor : b.color
    if (color) s['color'] = color
    if (blockFontStyle.value) Object.assign(s, blockFontStyle.value)
    return s
  })

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
    if (backgroundStyle.value.clip) {
      s['overflow'] = 'hidden'
    }
    return s
  })

  return { blockStyle, coords, backgroundStyle, textStyle }
}
