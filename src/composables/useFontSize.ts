export const useFontSize = (targetWidth: () => number | undefined, fullWidth?: () => boolean) => {
  const st = siteStore()
  const vp = viewportStore()

  const toPx = (base: number, vwAdd: number, width: number) =>
    (base + vwAdd) * width / 100 + 'px'

  const computedStyles = computed(() => {
    const opts = st.site?.options
    if (!opts) return null

    const tw = targetWidth()
    if (tw == null) return null

    const fw = fullWidth?.() ?? false
    let finalFontSize: string | number = opts.fontSize
    let finalLineHeight: string | number = opts.lineHeight

    if (fw && vp.mode === 'desktop') {
      const factor = 1.491 - 0.000965 * tw
      finalFontSize = toPx(opts.fontSize, factor, vp.width)
      finalLineHeight = parseFloat(finalFontSize) * opts.lineHeight + 'px'
    } else if (vp.mode === 'desktop' && (vp.forcedMode === 'desktop' || (!vp.forcedMode && tw >= vp.width))) {
      const factor = 1.491 - 0.000965 * tw
      const effectiveWidth = vp.forcedMode ? tw : vp.width
      finalFontSize = toPx(opts.fontSize, factor, effectiveWidth)
      finalLineHeight = parseFloat(finalFontSize) * opts.lineHeight + 'px'
    } else if (vp.mode === 'tablet' || vp.forcedMode === 'tablet') {
      const effectiveWidth = vp.forcedMode ? 820 : vp.width
      finalFontSize = toPx(opts.fontSize, 0.933, effectiveWidth)
      finalLineHeight = parseFloat(finalFontSize) * opts.lineHeight + 'px'
    } else if (vp.mode === 'mobile' || vp.forcedMode === 'mobile') {
      const effectiveWidth = vp.forcedMode ? 480 : vp.width
      finalFontSize = toPx(opts.fontSize, 3, effectiveWidth)
      finalLineHeight = parseFloat(finalFontSize) * opts.lineHeight + 'px'
    } else {
      finalFontSize = opts.fontSize + 'em'
      finalLineHeight = opts.lineHeight + 'em'
    }

    return { fontSize: finalFontSize, lineHeight: finalLineHeight }
  })

  return { computedStyles }
}
