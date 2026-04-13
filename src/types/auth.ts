export interface User {
  id: number
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ApiError {
  error: string
  code: number
}
export interface StoredError {
  id: string
  error: string
  code: number
}
