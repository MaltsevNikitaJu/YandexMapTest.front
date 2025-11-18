import type { AxiosInstance, AxiosResponse } from 'axios'
import { createApiClient, ensureCsrfCookie } from './http'

export interface YandexPlace {
  id: number
  user_id: number
  place_id: string
  name?: string | null
  url: string
}

export interface PlaceReviewAuthor {
  name: string
  avatarUrl: string | null
  professionLevel: string | null
}

export interface PlaceReview {
  id: string
  rating: number | null
  text: string
  updatedTime: string | null
  author: PlaceReviewAuthor
  businessComment: string | null
}

export interface PlaceReviewsSummary {
  rating: number | null
  ratingsCount: number | null
  reviewsCount: number | null
}

export interface PlaceReviewsResponse {
  place: {
    id: number
    name: string | null | undefined
    url: string
  }
  summary: PlaceReviewsSummary
  reviews: PlaceReview[]
}

const PLACES_ENDPOINT = '/api/yandex-places'

export class PlacesApi {
  private static _instance: PlacesApi
  private _client: AxiosInstance
  private _reviewsCache: Map<string, PlaceReviewsResponse>

  private constructor() {
    this._client = createApiClient()
    this._reviewsCache = new Map()
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new PlacesApi()
    }
    return this._instance
  }

  async list(): Promise<YandexPlace[]> {
    const response: AxiosResponse<YandexPlace[]> = await this._client.get(
      PLACES_ENDPOINT,
    )
    return response.data
  }

  async add(url: string): Promise<YandexPlace> {
    await ensureCsrfCookie(this._client)
    const response: AxiosResponse<YandexPlace> = await this._client.post(
      PLACES_ENDPOINT,
      { url },
    )
    return response.data
  }

  async remove(id: number): Promise<void> {
    await ensureCsrfCookie(this._client)
    await this._client.delete(`${PLACES_ENDPOINT}/${id}`)
  }

  async reviews(
    placeId: number,
    limit = 10,
    options?: { force?: boolean },
  ): Promise<PlaceReviewsResponse> {
    const key = `${placeId}:${limit}`

    if (!options?.force) {
      const cached = this._reviewsCache.get(key)
      if (cached) {
        return cached
      }
    }

    const response: AxiosResponse<PlaceReviewsResponse> = await this._client.get(
      `${PLACES_ENDPOINT}/${placeId}/reviews`,
      {
        params: {
          limit,
        },
      },
    )
    this._reviewsCache.set(key, response.data)

    return response.data
  }

  clearReviewsCache(): void {
    this._reviewsCache.clear()
  }
}


