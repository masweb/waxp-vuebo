export type PageType = 'page' | 'post'

export interface PageSeo {
  id?: number
  locale_code: string
  title: string
  description: string
}

export interface Slug {
  id?: number
  locale_code: string
  slug: string
}

export interface Page {
  id: number
  site_id: number
  blog_id: number | null
  parent_id: number | null
  type: PageType
  layout: Record<string, unknown>
  published_at: string | null
  title: string[]
  description: string[]
  seo: PageSeo[]
  slugs: Slug[]
  created_at: string
  updated_at: string
  children?: Page[]
}

export interface PageRoute {
  path: string
  page_id?: number
  blog_id?: number
}

export interface CreatePageRequest {
  type: PageType
  blog_id?: number | null
  parent_id?: number | null
  layout?: Record<string, unknown>
  published_at?: string | null
  seo?: Omit<PageSeo, 'id'>[]
  slugs: Omit<Slug, 'id'>[]
}

export interface UpdatePageRequest {
  parent_id?: number | null
  layout?: Record<string, unknown>
  published_at?: string | null
  seo?: Omit<PageSeo, 'id'>[]
  slugs: Omit<Slug, 'id'>[]
}

export interface ListPagesParams {
  cursor?: number
  limit?: number
  filter?: {
    type?: PageType
    parent_id?: number | null
    blog_id?: number
    published_at_isnull?: boolean
    id?: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  next_cursor: number | null
  total: number
  has_more: boolean
}

export type ListPagesResponse = PaginatedResponse<Page>

export type RoutesResponse = Record<string, PageRoute[]>
