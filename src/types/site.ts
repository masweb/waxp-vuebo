export interface Site {
  id: number
  name: string
  domain: string
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
