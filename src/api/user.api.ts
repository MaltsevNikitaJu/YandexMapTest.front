import type { AxiosInstance, AxiosResponse } from 'axios'
import { createApiClient, ensureCsrfCookie, resetCsrfState } from './http'

export interface UserProfile {
  id: number
  name: string
  email: string
}

const USER_ENDPOINT = '/api/user'
const LOGOUT_ENDPOINT = '/api/logout'
const USER_PASSWORD_ENDPOINT = '/api/user/password'

export class UserApi {
  private static _instance: UserApi
  private _client: AxiosInstance
  private _cachedUser: UserProfile | null = null

  private constructor() {
    this._client = createApiClient()
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new UserApi()
    }
    return this._instance
  }

  /** Возвращает текущего пользователя или null, если сессии нет. */
  async auth(force = false): Promise<UserProfile | null> {
    if (!force && this._cachedUser) {
      return this._cachedUser
    }

    try {
      const response: AxiosResponse<UserProfile> = await this._client.get(USER_ENDPOINT)
      this._cachedUser = response.data
      return this._cachedUser
    } catch (error: any) {
      if (error.response?.status === 401) {
        this._cachedUser = null
        return null
      }
      throw error
    }
  }

  setCachedUser(user: UserProfile | null) {
    this._cachedUser = user
  }

  /** Выход из аккаунта. */
  async logout() {
    await ensureCsrfCookie(this._client)
    await this._client.post(LOGOUT_ENDPOINT)
    this._cachedUser = null
    resetCsrfState()
  }

  async updateProfile(payload: { name?: string; email?: string }) {
    await ensureCsrfCookie(this._client)
    const response: AxiosResponse<UserProfile> = await this._client.patch(
      USER_ENDPOINT,
      payload,
    )
    this._cachedUser = response.data
    return this._cachedUser
  }

  async changePassword(payload: {
    current_password: string
    password: string
    password_confirmation: string
  }) {
    await ensureCsrfCookie(this._client)
    return this._client.post(USER_PASSWORD_ENDPOINT, payload)
  }
}
