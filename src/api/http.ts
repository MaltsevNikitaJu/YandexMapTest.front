import axios, { AxiosHeaders, type AxiosInstance } from 'axios'
import { getCsrfToken, setCsrfToken } from '@/utils'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://maltsevnikitaju-yandexmaptest-back-2e25.twc1.net'

let csrfInitialized = false

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    } as Record<string, string>,
  })

  client.interceptors.request.use((config) => {
    const token = getCsrfToken()
    if (token) {
      const headers = AxiosHeaders.from(config.headers ?? {})
      headers.set('X-XSRF-TOKEN', token)
      config.headers = headers
    }
    return config
  })

  return client
}

export async function ensureCsrfCookie(client: AxiosInstance): Promise<void> {
  if (csrfInitialized) return
  const response = await client.get('/sanctum/csrf-cookie')
  const headers = response.headers as AxiosHeaders & {
    get?: (headerName: string) => string | null
  }
  const headerToken =
    headers.get?.('x-xsrf-token') ?? (headers['x-xsrf-token'] as string | undefined)
  if (typeof headerToken === 'string') {
    setCsrfToken(headerToken)
  }
  csrfInitialized = true
}

export function resetCsrfState() {
  csrfInitialized = false
  setCsrfToken(null)
}
