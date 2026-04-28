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

    const vw = effectiveVpWidth(vp)
    const result = calcFluidFont(fs, lh, tw, vw, vp.mode, fw, opts.desktopTextZoom, opts.tabletTextZoom, opts.mobileTextZoom)

    const s: Record<string, string> = {}
    if (b.fontSize != null) s['font-size'] = result.fontSize
    if (b.lineHeight != null) s['line-height'] = result.lineHeight
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
      backgroundStyle.value.style
        .split(';')
        .filter(Boolean)
        .forEach(rule => {
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
    const b = block()
    const p = b.style?.padding
    if (p && (p.t !== '0' || p.r !== '0' || p.b !== '0' || p.l !== '0')) {
      s['padding'] = `${p.t} ${p.r} ${p.b} ${p.l}`
    }
    const m = b.style?.margin
    if (m && (m.t !== '0' || m.r !== '0' || m.b !== '0' || m.l !== '0')) {
      s['margin'] = `${m.t} ${m.r} ${m.b} ${m.l}`
    }
    return s
  })

  return { blockStyle, coords, backgroundStyle, textStyle }
}
