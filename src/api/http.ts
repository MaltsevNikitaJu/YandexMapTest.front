import axios, { type AxiosInstance } from 'axios'
import { getCsrfToken } from '@/utils'

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
      if (!config.headers) config.headers = {}
      config.headers['X-XSRF-TOKEN'] = token
    }
    return config
  })

  return client
}

export async function ensureCsrfCookie(client: AxiosInstance): Promise<void> {
  if (csrfInitialized) return
  await client.get('/sanctum/csrf-cookie')
  csrfInitialized = true
}

export function resetCsrfState() {
  csrfInitialized = false
}
