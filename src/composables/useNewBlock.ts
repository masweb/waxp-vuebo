import interact from 'interactjs'
import type { InteractEvent } from '@interactjs/core/InteractEvent'

export const useNewBlock = (sectionEl: Ref<HTMLElement | undefined>, section: () => Section) => {
  const dr = drawingStore()
  const { coords: drCoords } = storeToRefs(dr)
  const vp = viewportStore()
  const st = siteStore()
  const editor = editorStore()
  const { pixelToGrid, calculateGridPosition, pushDown, findFreeCoords, ensureRows, trimRows } = useGridConversion()

  let startCoords: { x: number; y: number } | null = null
  let sectionRect: DOMRect | null = null
  let interactable: ReturnType<typeof interact> | null = null
  let lastArgs: any = null
  let throttleTimer: number | null = null
  let cancelled = false

  const getBpConfig = () => {
    return section()[vp.mode] as BreakpointSize
  }

  const throttledDraw = (event: InteractEvent) => {
    if (cancelled || !startCoords || !sectionEl.value || !sectionRect) return
    const config = getBpConfig()
    const endX = ~~event.clientX - ~~sectionRect.left
    const endY = ~~event.clientY - ~~sectionRect.top
    lastArgs = { endX, endY, config, el: sectionEl.value, id: section().id }
    if (throttleTimer) return
    throttleTimer = window.requestAnimationFrame(() => {
      if (!lastArgs) return
      dr.draw(
        startCoords!.x,
        startCoords!.y,
        lastArgs.endX,
        lastArgs.endY,
        lastArgs.el,
        lastArgs.config,
        lastArgs.id,
        true
      )

      if (drCoords.value) {
        const needed = drCoords.value.y + drCoords.value.h
        if (needed > lastArgs.config.rows) getBpConfig().rows = needed
      }

      throttleTimer = null
    })
  }

  const hs = historyStore()

  const onEnd = async (event: InteractEvent) => {
    if (cancelled || !startCoords || !sectionEl.value || !sectionRect) return

    const config = getBpConfig()
    const endX = ~~event.clientX - ~~sectionRect.left
    const endY = ~~event.clientY - ~~sectionRect.top
    const drawnCoords = calculateGridPosition(startCoords.x, startCoords.y, endX, endY, sectionEl.value, config, true)

    startCoords = null
    sectionRect = null
    lastArgs = null
    throttleTimer = null
    dr.resetDrawing()

    const blockType = await editor.requestBlockType()
    if (!blockType) return

    hs.snapshot()

    const sec = section()
    const modeKey = MODE_KEY[vp.mode]
    const resp = await useApi(`/api/sites/${st.site?.id}/blocks/next-id`, { method: 'POST' })

    const block: Block = {
      id: resp.id,
      type: blockType,
      ...(blockType === 'Text' ? { locales: { text: '' } } : {}),
      d: { x: 1, y: 1, w: 1, h: 1 },
      m: { x: 1, y: 1, w: 1, h: 1 },
      t: { x: 1, y: 1, w: 1, h: 1 },
      ...(blockType === 'Text' ? { color: null, darkColor: null, fontSize: null, lineHeight: null } : {}),
      ...(blockType === 'Space'
        ? { divider: { active: false, color: '#cccccc', thick: '1', mode: 'solid' as const } }
        : {}),
      ...(blockType === 'DarkMode' ? { color: null, darkColor: null, fontSize: null } : {}),
      ...(blockType === 'Image'
        ? {
            locales: { alt: '' },
            image: { url_desk: '', url_tab: '', url_mob: '', fit: 'cover' as const }
          }
        : {}),
      style: {
        hideOn: [],
        background: {
          mode: 'none',
          lightColor: '',
          darkcolorColor: '',
          url_desk: '',
          url_tab: '',
          url_mob: '',
          fix_img_back: false,
          opacity: '',
          pos: 'cover',
          size: '',
          repeat: false,
          lightGradA: '',
          lightGradB: '',
          darkGradA: '',
          darkGradB: '',
          gradDeg: '',
          focalX: '50',
          focalY: '50',
          zoom: '100'
        },
        border: {
          radius: {
            tl: '0',
            tr: '0',
            br: '0',
            bl: '0'
          },
          allBorders: {
            active: false,
            thick: '0',
            color: 'transparent',
            mode: 'none'
          },
          sidesBorders: {
            l: {
              active: false,
              thick: '0',
              color: 'transparent',
              mode: 'none'
            },
            t: {
              active: false,
              thick: '0',
              color: 'transparent',
              mode: 'none'
            },
            r: {
              active: false,
              thick: '0',
              color: 'transparent',
              mode: 'none'
            },
            b: {
              active: false,
              thick: '0',
              color: 'transparent',
              mode: 'none'
            }
          }
        },
        padding: {
          t: '0',
          r: '0',
          b: '0',
          l: '0'
        }
      }
    }

    block[modeKey] = drawnCoords
    sec.blocks.push(block)

    pushDown(sec.blocks, modeKey, drawnCoords, block.id)
    ensureRows(sec, vp.mode)

    const otherModes = (['mobile', 'tablet', 'desktop'] as ViewportMode[]).filter(m => m !== vp.mode)
    for (const mode of otherModes) {
      block[MODE_KEY[mode]] = findFreeCoords(sec, mode, drawnCoords.w, drawnCoords.h)
    }

    trimRows(sec)
  }

  onMounted(() => {
    if (!sectionEl.value) return
    interactable = interact(sectionEl.value)
    interactable
      .draggable({
        ignoreFrom: '.blockui',
        listeners: {
          start(event) {
            cancelled = false
            if (editor.mode !== 'draw') {
              cancelled = true
              return
            }

            sectionRect = sectionEl.value!.getBoundingClientRect()
            const sx = ~~event.clientX - ~~sectionRect.left
            const sy = ~~event.clientY - ~~sectionRect.top

            const config = getBpConfig()
            const gridPos = pixelToGrid(sx, sy, sectionEl.value!, config)
            const key = MODE_KEY[vp.mode] as keyof Block
            const sec = section()

            const overBlock = sec.blocks.some(b => {
              const c = b[key] as BlockCoords
              return gridPos.col >= c.x && gridPos.col < c.x + c.w && gridPos.row >= c.y && gridPos.row < c.y + c.h
            })

            if (overBlock) {
              cancelled = true
              return
            }

            startCoords = { x: sx, y: sy }
          },
          move: throttledDraw,
          end: onEnd
        }
      })
      .styleCursor(false)
  })

  onUnmounted(() => {
    interactable?.unset()
    if (throttleTimer) cancelAnimationFrame(throttleTimer)
  })
}
