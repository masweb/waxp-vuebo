import type { siteOptions } from './defaultOptions'

export interface SiteRoute {
  path: string
  page_id: number
}

export interface Site {
  id: number
  name: string
  domain: string
  locales: string[]
  options: siteOptions
  routes?: Record<string, SiteRoute[]>
}

export interface CreateSiteRequest {
  name: string
  domain: string
}

export interface UpdateSiteRequest {
  name: string
  domain: string
}

export interface PaginatedResponse<T> {
  data: T[]
  next_cursor: number | null
  total: number
  has_more: boolean
}

export interface ListSitesParams {
  cursor?: number
  limit?: number
}
