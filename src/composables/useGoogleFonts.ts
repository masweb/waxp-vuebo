import { computed, ref } from 'vue'
import { db } from '@/db/fonts'
import type { GoogleFont, ActiveVariant } from '@/db/fonts'

type VariantStatus = Record<string, boolean>

let allFonts: GoogleFont[] = []
let variantStatus: Record<string, VariantStatus> = {}
let initialized = false
const initPromise = { current: null as Promise<void> | null }

const variantId = (family: string, variant: string): string =>
  `${family}::${variant}`

const normalizeVariant = (variant: string): { weight: string; style: string } => {
  const isItalic = variant.endsWith('italic')
  const raw = isItalic ? variant.slice(0, -6) : variant
  const weight = raw === 'regular' ? '400' : raw === 'bold' ? '700' : raw
  return { weight, style: isItalic ? 'italic' : 'normal' }
}

const injectFontLink = (family: string, variants: string[]): void => {
  if (!family || typeof document === 'undefined') return

  const encoded = variants.map(v => {
    const { weight, style } = normalizeVariant(v)
    return style === 'italic' ? `${weight}i` : weight
  })

  const familyEncoded = family.replace(/\s+/g, '+')
  const params = `family=${familyEncoded}:wght@${encoded.join(';')}`

  const existing = document.querySelector(`link[data-font-family="${CSS.escape(family)}"]`)
  if (existing) existing.remove()

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`
  link.setAttribute('data-font-family', family)
  document.head.appendChild(link)
}

const removeFontLink = (family: string): void => {
  if (typeof document === 'undefined') return
  const link = document.querySelector(`link[data-font-family="${CSS.escape(family)}"]`)
  link?.remove()
}

const updateFamilyLink = (family: string): void => {
  const statuses = variantStatus[family]
  if (!statuses) return

  const activeVariants = Object.entries(statuses)
    .filter(([, active]) => active)
    .map(([variant]) => variant)

  if (activeVariants.length > 0) {
    injectFontLink(family, activeVariants)
  } else {
    removeFontLink(family)
  }
}

export const useGoogleFonts = () => {
  const ready = ref(false)
  const results = ref<GoogleFont[]>([])
  const loading = ref(false)

  const activeFamilies = computed(() => {
    const families: string[] = []
    for (const [family, statuses] of Object.entries(variantStatus)) {
      if (Object.values(statuses).some(Boolean)) families.push(family)
    }
    return families
  })

  const activeFontsCount = computed(() => activeFamilies.value.length)

  const init = async () => {
    if (initialized) {
      ready.value = true
      return
    }
    if (initPromise.current) {
      await initPromise.current
      ready.value = true
      return
    }

    initPromise.current = (async () => {
      loading.value = true
      try {
        const count = await db.googleFonts.count()

        if (count === 0) {
          const resp = await fetch('/googleFontsInfo.json')
          const raw = (await resp.json()) as {
            items: Array<{
              family: string
              category: string
              variants: string[]
              subsets: string[]
              version: string
              lastModified: string
            }>
          }

          const fonts: GoogleFont[] = raw.items.map(item => ({
            family: item.family,
            category: item.category,
            variants: item.variants,
            subsets: item.subsets,
            version: item.version,
            lastModified: item.lastModified
          }))

          await db.googleFonts.bulkPut(fonts)
          allFonts = fonts
        } else {
          allFonts = await db.googleFonts.toArray()
        }

        const activeRecords = await db.activeVariants.toArray()
        variantStatus = {}
        for (const record of activeRecords) {
          if (!variantStatus[record.family]) variantStatus[record.family] = {}
          variantStatus[record.family][record.variant] = record.active
        }

        for (const family of activeFamilies.value) {
          updateFamilyLink(family)
        }

        initialized = true
      } finally {
        loading.value = false
      }
    })()

    await initPromise.current
    ready.value = true
  }

  let searchTimer: ReturnType<typeof setTimeout>

  const search = (query: string) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      if (!query.trim()) {
        results.value = allFonts.slice(0, 200)
        return
      }
      const q = query.toLowerCase()
      results.value = allFonts
        .filter(f => f.family.toLowerCase().includes(q))
        .slice(0, 200)
    }, 150)
  }

  const getFont = (family: string): GoogleFont | undefined =>
    allFonts.find(f => f.family === family)

  const getVariantStatus = (family: string): VariantStatus =>
    variantStatus[family] ?? {}

  const isVariantActive = (family: string, variant: string): boolean =>
    variantStatus[family]?.[variant] ?? false

  const toggleVariant = async (family: string, variant: string) => {
    const current = variantStatus[family]?.[variant] ?? false
    const next = !current

    if (!variantStatus[family]) variantStatus[family] = {}
    variantStatus[family][variant] = next

    const id = variantId(family, variant)
    await db.activeVariants.put({
      id,
      family,
      variant,
      active: next
    })

    updateFamilyLink(family)
  }

  const activateVariant = async (family: string, variant: string) => {
    if (variantStatus[family]?.[variant]) return

    if (!variantStatus[family]) variantStatus[family] = {}
    variantStatus[family][variant] = true

    const id = variantId(family, variant)
    await db.activeVariants.put({ id, family, variant, active: true })

    updateFamilyLink(family)
  }

  const deactivateVariant = async (family: string, variant: string) => {
    if (!variantStatus[family]?.[variant]) return

    variantStatus[family][variant] = false

    const id = variantId(family, variant)
    await db.activeVariants.put({ id, family, variant, active: false })

    updateFamilyLink(family)
  }

  const activateAllVariants = async (family: string) => {
    const font = getFont(family)
    if (!font) return

    if (!variantStatus[family]) variantStatus[family] = {}

    const records: ActiveVariant[] = []
    for (const variant of font.variants) {
      variantStatus[family][variant] = true
      records.push({
        id: variantId(family, variant),
        family,
        variant,
        active: true
      })
    }

    await db.activeVariants.bulkPut(records)
    updateFamilyLink(family)
  }

  const deactivateAllVariants = async (family: string) => {
    const statuses = variantStatus[family]
    if (!statuses) return

    const records: ActiveVariant[] = []
    for (const variant of Object.keys(statuses)) {
      statuses[variant] = false
      records.push({
        id: variantId(family, variant),
        family,
        variant,
        active: false
      })
    }

    await db.activeVariants.bulkPut(records)
    removeFontLink(family)
  }

  const loadPreview = (family: string, variant: string) => {
    const { weight, style } = normalizeVariant(variant)
    const w =
      weight === '400'
        ? style === 'italic'
          ? 'italic'
          : 'regular'
        : `${weight}${style === 'italic' ? 'italic' : ''}`
    injectFontLink(family, [w])
  }

  return {
    ready,
    loading,
    results,
    activeFamilies,
    activeFontsCount,
    init,
    search,
    getFont,
    getVariantStatus,
    isVariantActive,
    toggleVariant,
    activateVariant,
    deactivateVariant,
    activateAllVariants,
    deactivateAllVariants,
    loadPreview
  }
}

export default useGoogleFonts
