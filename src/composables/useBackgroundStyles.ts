export const useBackgroundStyles = (
  bgGetter: () => Background | undefined,
  themeGetter: () => 'light' | 'dark',
  modeGetter: () => ViewportMode
) => {
  const apiBase = import.meta.env.VITE_END_POINT

  return computed(() => {
    const bg = bgGetter()
    if (!bg || bg.mode === 'none') return { style: '', overlay: '' }

    const theme = themeGetter()
    const mode = modeGetter()
    const rules: string[] = []
    const overlayRules: string[] = []
    const hasOpacity = bg.mode === 'image' && bg.opacity != null && bg.opacity !== '' && bg.opacity !== '1'
    const opacityVal = hasOpacity ? Number(bg.opacity) : 1

    if (bg.mode === 'color') {
      const color = theme === 'dark' ? bg.darkcolorColor : bg.lightColor
      if (color) rules.push(`background-color: ${color};`)
    }

    if (bg.mode === 'gradient') {
      const a = theme === 'dark' ? bg.darkGradA : bg.lightGradA
      const b = theme === 'dark' ? bg.darkGradB : bg.lightGradB
      const deg = bg.gradDeg || '0'
      if (a && b) {
        rules.push(`background: linear-gradient(${deg}deg, ${a}, ${b});`)
      } else if (a) {
        rules.push(`background-color: ${a};`)
      }
    }

    if (bg.mode === 'image') {
      const url =
        mode === 'mobile'
          ? bg.url_mov || bg.url_desk
          : mode === 'tablet'
            ? bg.url_mov || bg.url_desk
            : bg.url_desk

      if (url) {
        if (hasOpacity) {
          overlayRules.push(`background-image: url('${apiBase}${url}');`)
          overlayRules.push(`opacity: ${opacityVal};`)
        } else {
          rules.push(`background-image: url('${apiBase}${url}');`)
        }

        const target = hasOpacity ? overlayRules : rules

        if (bg.fix_img_back) target.push('background-attachment: fixed;')

        const posMap: Record<string, string> = {
          img: 'center center',
          cover: 'center center',
          contain: 'center center',
          top: 'center top',
          bottom: 'center bottom',
          left: 'left center',
          right: 'right center'
        }
        target.push(`background-position: ${posMap[bg.pos] || 'center center'};`)

        if (bg.pos === 'cover') target.push('background-size: cover;')
        else if (bg.pos === 'contain') target.push('background-size: contain;')
        else target.push('background-size: auto;')

        target.push(`background-repeat: ${bg.repeat ? 'repeat' : 'no-repeat'};`)
      }
    }

    return {
      style: rules.join(' '),
      overlay: overlayRules.join(' ')
    }
  })
}
