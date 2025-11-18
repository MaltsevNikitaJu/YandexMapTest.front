<template>
  <section class="page reviews-page">
    <div class="page-header">
      <div>
        <h1>Отзывы</h1>
        <p>Выберите заведение, чтобы увидеть свежие отзывы гостей.</p>
      </div>
    </div>

    <div class="tabs-wrapper" v-if="places.length">
      <button
        v-for="place in places"
        :key="place.id"
        type="button"
        :class="['tab-button', { active: place.id === selectedPlaceId }]"
        @click="handleSelectPlace(place.id)"
      >
        <span class="tab-name">{{ place.name || 'Без названия' }}</span>
        <span class="tab-id">ID {{ place.place_id }}</span>
      </button>
    </div>
    <div v-else-if="!isLoadingPlaces" class="empty-placeholder">
      <p>Добавьте заведение в разделе «Настройка», чтобы видеть его отзывы.</p>
    </div>

    <div v-if="error" class="message error">{{ error }}</div>
    <div v-if="isLoadingPlaces" class="message muted">Загружаем заведения...</div>
    <div v-else-if="selectedPlaceId && isLoadingReviews" class="message muted">Загружаем отзывы...</div>

    <template v-if="reviewsData && !isLoadingReviews">
      <div class="summary-card">
        <div class="summary-block">
          <span class="summary-label">Средняя оценка</span>
          <div class="summary-rating">
            <span class="summary-value rating">
              {{ reviewsData.summary.rating?.toFixed(1) ?? '—' }}
            </span>
            <div class="stars">
              <span
                v-for="star in 5"
                :key="star"
                :class="['star', { filled: isStarFilled(reviewsData.summary.rating, star) }]"
              >
                ★
              </span>
            </div>
          </div>
        </div>
        <div class="summary-block">
          <span class="summary-label">Количество оценок</span>
          <span class="summary-value">{{ formatNumber(reviewsData.summary.ratingsCount) }}</span>
        </div>
        <div class="summary-block">
          <span class="summary-label">Всего отзывов</span>
          <span class="summary-value">{{ formatNumber(reviewsData.summary.reviewsCount) }}</span>
        </div>
      </div>

      <ul class="reviews-list" v-if="reviewsData.reviews.length">
        <li v-for="review in reviewsData.reviews" :key="review.id" class="review-card">
          <header class="review-header">
            <div class="author">
              <img
                v-if="review.author.avatarUrl"
                :src="normalizeAvatar(review.author.avatarUrl)"
                alt="Аватар"
              />
              <div>
                <p class="author-name">{{ review.author.name }}</p>
                <p class="author-profession" v-if="review.author.professionLevel">
                  {{ review.author.professionLevel }}
                </p>
              </div>
            </div>
            <div class="review-rating" v-if="review.rating">
              <span class="review-rating-value">
                {{ review.rating.toFixed(1) }}
              </span>
              <div class="stars">
                <span
                  v-for="star in 5"
                  :key="star"
                  :class="['star', { filled: isStarFilled(review.rating, star) }]"
                >
                  ★
                </span>
              </div>
            </div>
          </header>
          <p class="review-text">{{ review.text }}</p>
          <footer class="review-footer">
            <span class="review-date">{{ formatDate(review.updatedTime) }}</span>
          </footer>
          <div class="business-comment" v-if="review.businessComment">
            <p class="business-comment-title">Ответ заведения</p>
            <p>{{ review.businessComment }}</p>
          </div>
        </li>
      </ul>
      <div v-else class="message muted">Для этого заведения пока нет отзывов.</div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { UserProfile } from '@/api/user.api'
import {
  PlacesApi,
  type PlaceReviewsResponse,
  type YandexPlace,
} from '@/api/places.api'

defineProps<{
  user: UserProfile | null
}>()

const placesApi = PlacesApi.getInstance()
const places = ref<YandexPlace[]>([])
const reviewsData = ref<PlaceReviewsResponse | null>(null)
const selectedPlaceId = ref<number | null>(null)
const isLoadingPlaces = ref(false)
const isLoadingReviews = ref(false)
const error = ref('')

onMounted(async () => {
  await loadPlaces()
})

async function loadPlaces() {
  error.value = ''
  isLoadingPlaces.value = true
  try {
    places.value = await placesApi.list()
    const first = places.value[0]
    if (first) {
      await handleSelectPlace(first.id)
    }
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } }; message?: string }
    error.value =
      axiosError?.response?.data?.message ||
      axiosError?.message ||
      'Не удалось загрузить список заведений'
  } finally {
    isLoadingPlaces.value = false
  }
}

async function handleSelectPlace(placeId: number) {
  if (selectedPlaceId.value === placeId && reviewsData.value) {
    return
  }
  selectedPlaceId.value = placeId
  error.value = ''
  isLoadingReviews.value = true

  try {
    reviewsData.value = await placesApi.reviews(placeId, 10)
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } }; message?: string }
    error.value =
      axiosError?.response?.data?.message ||
      axiosError?.message ||
      'Не удалось получить отзывы с Яндекс-Карт'
    reviewsData.value = null
  } finally {
    isLoadingReviews.value = false
  }
}

function isStarFilled(rating: number | null | undefined, starIndex: number): boolean {
  if (rating == null) return false
  // Немного мягкий порог: 3.6 -> 4 звезды и т.п.
  return rating >= starIndex - 0.25
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Дата не указана'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('ru-RU').format(value)
}

function normalizeAvatar(url: string): string {
  if (url.includes('{size}')) {
    return url.replace('{size}', '80x80')
  }
  return url
}
</script>

<style scoped>
.page {
  padding: 32px 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #111827;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
  color: #6b7280;
  font-size: 14px;
}

.user-name {
  font-weight: 600;
  color: #111827;
}

.tabs-wrapper {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-button {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 20px;
  background: #f9fafb;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  transition: all 0.2s ease;
}

.tab-button:hover {
  border-color: #d1d5db;
  background: #fff;
}

.tab-button.active {
  border-color: #d0d7de;
  background: #fff;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
}

.tab-name {
  font-weight: 600;
  color: #111827;
}

.tab-id {
  font-size: 12px;
  color: #6b7280;
}

.empty-placeholder,
.message {
  padding: 20px;
  border-radius: 16px;
  background: #f9fafb;
  color: #4b5563;
}

.message.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.message.muted {
  background: #f3f4f6;
  color: #6b7280;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding: 20px;
  border-radius: 20px;
  background: #111827;
  color: #f9fafb;
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}

.summary-value {
  font-size: 28px;
  font-weight: 600;
}

.summary-value.rating {
  font-size: 40px;
}

.summary-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 18px;
  color: #4b5563;
}

.star.filled {
  color: #facc15;
}

.reviews-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  display: flex;
  gap: 12px;
  align-items: center;
}

.author img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  margin: 0;
  font-weight: 600;
  color: #111827;
}

.author-profession {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-rating-value {
  font-size: 18px;
  font-weight: 600;
  color: #f97316;
}

.review-text {
  margin: 0;
  line-height: 1.6;
  color: #374151;
}

.review-footer {
  font-size: 13px;
  color: #9ca3af;
}

.business-comment {
  margin-top: 8px;
  padding: 16px;
  background: #fef9c3;
  border-radius: 12px;
  border: 1px solid #fcd34d;
  color: #78350f;
}

.business-comment-title {
  margin: 0 0 6px 0;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page {
    padding: 24px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-info {
    text-align: left;
  }

  .tab-button {
    width: 100%;
  }
}
</style>

