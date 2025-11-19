import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type RawAxiosResponseHeaders,
} from 'axios'
import { getCsrfToken, setCsrfToken } from '@/utils'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://maltsevnikitaju-yandexmaptest-back-2e25.twc1.net'

let csrfInitialized = false

function extractXsrfToken(headers?: RawAxiosResponseHeaders | AxiosHeaders): string | undefined {
  if (!headers) return undefined
  if (headers instanceof AxiosHeaders) {
    const value = headers.get('x-xsrf-token')
    return typeof value === 'string' ? value : undefined
  }
  const headerValue = (headers as Record<string, unknown>)['x-xsrf-token']
  return typeof headerValue === 'string' ? headerValue : undefined
}

function syncXsrfFromResponse<T>(response: AxiosResponse<T>) {
  const token = extractXsrfToken(response.headers)
  if (token) {
    setCsrfToken(token)
  }
  return response
}

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
  client.interceptors.response.use(
    (response) => syncXsrfFromResponse(response),
    (error) => {
      if (error?.response) {
        syncXsrfFromResponse(error.response)
      }
      throw error
    },
  )

  return client
}

export async function ensureCsrfCookie(client: AxiosInstance): Promise<void> {
  if (csrfInitialized) return
  const response = await client.get('/sanctum/csrf-cookie')
  const headerToken = extractXsrfToken(response.headers)
  if (headerToken) {
    setCsrfToken(headerToken)
  }
  csrfInitialized = true
}

export function resetCsrfState() {
  csrfInitialized = false
  setCsrfToken(null)
}
