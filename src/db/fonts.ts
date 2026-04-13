import Dexie, { type EntityTable } from 'dexie'

export interface GoogleFont {
  family: string
  category: string
  variants: string[]
  subsets: string[]
  lastModified: string
  version: string
}

export interface ActiveVariant {
  id: string
  family: string
  variant: string
  active: boolean
}

class VueboDB extends Dexie {
  googleFonts!: EntityTable<GoogleFont, 'family'>
  activeVariants!: EntityTable<ActiveVariant, 'id'>

  constructor() {
    super('vuebo-db')

    this.version(1).stores({
      googleFonts: 'family, category',
      activeVariants: 'id, family, active, [family+variant]'
    })
  }
}

export const db = new VueboDB()
