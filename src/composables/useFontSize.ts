export const useFontSize = (targetWidth: () => number | undefined, fullWidth?: () => boolean) => {
  const st = siteStore()
  const vp = viewportStore()

  const computedStyles = computed(() => {
    const opts = st.site?.options
    if (!opts) return null

    const tw = targetWidth()
    if (tw == null) return null

    const fw = fullWidth?.() ?? false
    const vw = effectiveVpWidth(vp)

    return calcFluidFont(opts.fontSize, opts.lineHeight, tw, vw, vp.mode, fw, opts.desktopTextZoom, opts.tabletTextZoom, opts.mobileTextZoom)
  })

  return { computedStyles }
}

export function calcFluidFont(
  fontSize: number,
  lineHeight: number,
  targetWidth: number,
  viewportWidth: number,
  viewportMode: ViewportMode,
  fullWidth: boolean,
  desktopTextZoom: number,
  tabletTextZoom: number,
  mobileTextZoom: number
): { fontSize: string; lineHeight: string } {
  if (!fullWidth && viewportWidth >= targetWidth) {
    return { fontSize: fontSize + 'em', lineHeight: lineHeight + 'em' }
  }

  if (viewportMode === 'desktop') {
    if (fullWidth) {
      const zoomFactor = 1.491 - 0.000965 * targetWidth
      const pxResult = (fontSize + zoomFactor) * viewportWidth / 100
      return { fontSize: pxResult + 'px', lineHeight: pxResult * lineHeight + 'px' }
    }
    const fixedPx = fontSize * 16
    const reduction = 1 - viewportWidth / targetWidth
    const fs = fixedPx * (1 - desktopTextZoom * reduction)
    return { fontSize: fs + 'px', lineHeight: fs * lineHeight + 'px' }
  }

  const zoomFactor = viewportMode === 'mobile' ? mobileTextZoom : tabletTextZoom
  const pxResult = (fontSize + zoomFactor) * viewportWidth / 100
  return { fontSize: pxResult + 'px', lineHeight: pxResult * lineHeight + 'px' }
}

export function effectiveVpWidth(vp: ReturnType<typeof viewportStore>): number {
  if (vp.forcedMode === 'tablet') return 820
  if (vp.forcedMode === 'mobile') return 480
  return vp.width
}
