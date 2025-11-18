import type { AxiosInstance } from 'axios'
import { createApiClient, ensureCsrfCookie, resetCsrfState } from './http'
import type { UserProfile } from './user.api'

const REGISTER_ENDPOINT = '/api/register'
const LOGIN_ENDPOINT = '/api/login'
const LOGOUT_ENDPOINT = '/api/logout'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

interface AuthResponse {
  user: UserProfile
  message?: string
}

/** API for Laravel session-based auth. */
export class AuthApi {
  private static _instance: AuthApi
  private _client: AxiosInstance

  private constructor() {
    this._client = createApiClient()
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new AuthApi()
    }
    return this._instance
  }

  /** Register with name, email and password. */
  async register(payload: RegisterPayload) {
    await ensureCsrfCookie(this._client)
    const response = await this._client.post<AuthResponse>(REGISTER_ENDPOINT, payload)
    return response.data
  }

  /** Login by email and password. */
  async login(payload: LoginPayload) {
    await ensureCsrfCookie(this._client)
    const response = await this._client.post<AuthResponse>(LOGIN_ENDPOINT, payload)
    return response.data
  }

  /** Logout current session. */
  async logout() {
    await ensureCsrfCookie(this._client)
    await this._client.post(LOGOUT_ENDPOINT)
    resetCsrfState()
  }
}
