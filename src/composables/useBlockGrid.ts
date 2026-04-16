import { computed } from 'vue'

const modeKey: Record<ViewportMode, 'd' | 'm' | 't'> = {
  mobile: 'm',
  tablet: 't',
  desktop: 'd'
}

export const useBlockGrid = (block: () => Block) => {
  const vp = viewportStore()
  const coords = computed(() => block()[modeKey[vp.mode]])

  const blockStyle = computed(() => ({
    gridColumn: `${coords.value.x} / span ${coords.value.w}`,
    gridRow: `${coords.value.y} / span ${coords.value.h}`
  }))

  return { blockStyle, coords }
}
