<template>
  <section class="page settings-page">
    <div class="page-header">
      <h1>Настройки аккаунта</h1>
      <p>Управляйте параметрами аккаунта и уведомлениями.</p>
    </div>

    <div class="page-body">
      <p v-if="user">
        Пользователь: <strong>{{ user.name }}</strong><br />
        Email: <strong>{{ user.email }}</strong>
      </p>
      <p v-else>Загрузка данных пользователя...</p>

      <div class="settings-grid">
        <div class="settings-card">
          <button class="btn toggle" type="button" @click="showNameForm = !showNameForm">
            {{ showNameForm ? 'Скрыть изменение имени' : 'Изменить имя' }}
          </button>
          <transition name="fade">
            <div v-if="showNameForm" class="card-body">
              <h2>Изменить имя</h2>
              <label>
                Новое имя
                <input v-model="displayName" type="text" placeholder="Введите новое имя" />
              </label>
              <button class="btn primary" type="button" :disabled="isSavingName" @click="saveName">
                {{ isSavingName ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </transition>
        </div>

        <div class="settings-card">
          <button class="btn toggle" type="button" @click="showPasswordForm = !showPasswordForm">
            {{ showPasswordForm ? 'Скрыть смену пароля' : 'Сменить пароль' }}
          </button>
          <transition name="fade">
            <div v-if="showPasswordForm" class="card-body">
              <h2>Смена пароля</h2>
              <label>
                Текущий пароль
                <input v-model="currentPassword" type="password" placeholder="Введите текущий пароль" />
              </label>
              <label>
                Новый пароль
                <input v-model="newPassword" type="password" placeholder="Введите новый пароль" />
              </label>
              <label>
                Повторите новый пароль
                <input
                  v-model="newPasswordConfirmation"
                  type="password"
                  placeholder="Повторите новый пароль"
                />
              </label>
              <button class="btn primary" type="button" :disabled="isSavingPassword" @click="savePassword">
                {{ isSavingPassword ? 'Сохранение...' : 'Сменить пароль' }}
              </button>
              <p v-if="passwordMessage" :class="passwordSuccess ? 'info-message' : 'error-message'">
                {{ passwordMessage }}
              </p>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div class="page-header">
      <h1>Подключить Яндекс</h1>
      <p>Укажите ссылку на заведение в Яндекс Картах.</p>
      <p>
        Пример ссылки:
        "https://yandex.ru/maps/org/samoye_populyarnoye_kafe_tsentr/1010501395/?indoorLevel=1&ll=49.680680%2C58.602888&z=17"
      </p>
    </div>

    <div class="page-body">
      <div class="yandex-form">
        <label>
          Ссылка на заведение
          <input
            v-model="yandexUrl"
            type="text"
            placeholder="Вставьте ссылку на заведение в Яндекс Картах"
          />
        </label>
        <button class="btn primary" :disabled="isSavingPlace" @click="savePlace">
          {{ isSavingPlace ? 'Сохранение...' : 'Сохранить заведение' }}
        </button>
        <p v-if="placesError" class="error-message">
          {{ placesError }}
        </p>
      </div>

      <div v-if="places.length" class="places-list">
        <h2>Подключённые заведения</h2>
        <ul>
          <li v-for="place in places" :key="place.id" class="place-item">
            <div class="place-info">
              <span class="place-name">{{ place.name || 'Без названия' }}</span>
              <span class="place-id">ID: {{ place.place_id }}</span>
              <a :href="place.url" target="_blank" rel="noopener noreferrer">Открыть в Яндекс Картах</a>
            </div>
            <button class="btn secondary" type="button" @click="removePlace(place.id)">Удалить</button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { UserProfile } from '@/api/user.api'
import { UserApi } from '@/api/user.api'
import { PlacesApi, type YandexPlace } from '@/api/places.api'
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  user: UserProfile | null
}>()

const userApi = UserApi.getInstance()
const placesApi = PlacesApi.getInstance()

const displayName = ref('')
const isSavingName = ref(false)
const showNameForm = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const isSavingPassword = ref(false)
const passwordMessage = ref('')
const passwordSuccess = ref(false)
const showPasswordForm = ref(false)

const yandexUrl = ref('')
const isSavingPlace = ref(false)
const placesError = ref('')
const places = ref<YandexPlace[]>([])

watch(
  () => props.user,
  (val) => {
    if (val) {
      displayName.value = val.name
    }
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    places.value = await placesApi.list()
  } catch (error) {
    console.error('Не удалось загрузить заведения', error)
  }
})

const saveName = async () => {
  if (!displayName.value) return
  isSavingName.value = true
  try {
    await userApi.updateProfile({ name: displayName.value })
  } finally {
    isSavingName.value = false
  }
}

const savePassword = async () => {
  passwordMessage.value = ''
  passwordSuccess.value = false
  if (!currentPassword.value || !newPassword.value) {
    passwordMessage.value = 'Заполните все поля для смены пароля'
    return
  }
  if (newPassword.value !== newPasswordConfirmation.value) {
    passwordMessage.value = 'Новый пароль и подтверждение не совпадают'
    return
  }

  isSavingPassword.value = true
  try {
    await userApi.changePassword({
      current_password: currentPassword.value,
      password: newPassword.value,
      password_confirmation: newPasswordConfirmation.value,
    })
    passwordMessage.value = 'Пароль успешно изменён'
    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    newPasswordConfirmation.value = ''
  } catch (error: any) {
    const apiError = error.response?.data
    passwordMessage.value =
      apiError?.message ?? 'Не удалось изменить пароль. Проверьте введённые данные'
  } finally {
    isSavingPassword.value = false
  }
}

const savePlace = async () => {
  placesError.value = ''
  if (!yandexUrl.value) {
    placesError.value = 'Укажите ссылку на заведение'
    return
  }

  isSavingPlace.value = true
  try {
    const place = await placesApi.add(yandexUrl.value)
    places.value.push(place)
    yandexUrl.value = ''
  } catch (error: any) {
    const apiError = error.response?.data
    placesError.value =
      apiError?.message ?? 'Не удалось сохранить заведение. Проверьте ссылку'
  } finally {
    isSavingPlace.value = false
  }
}

const removePlace = async (id: number) => {
  try {
    await placesApi.remove(id)
    places.value = places.value.filter((p) => p.id !== id)
  } catch (error) {
    console.error('Не удалось удалить заведение', error)
  }
}
</script>

<style scoped>
.page {
  padding: 40px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: #111827;
}

.page-header p {
  margin: 0;
  color: #6B7280;
}

.page-body {
  margin-top: 24px;
  background-color: #f9fafb;
  border-radius: 16px;
  padding: 24px;
  color: #374151;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.settings-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-card .btn.toggle {
  align-self: flex-start;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-card h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #111827;
}

.settings-card label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #374151;
}

.settings-card input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.settings-card input:focus {
  outline: none;
  border-color: #2563eb;
}

.btn {
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin-top: 8px;
}

.btn.primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #111827;
}

.btn.toggle {
  background-color: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.info-message {
  margin-top: 8px;
  font-size: 13px;
  color: #059669;
}

.error-message {
  margin-top: 8px;
  font-size: 13px;
  color: #dc2626;
}

.yandex-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.yandex-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #374151;
}

.yandex-form input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.places-list {
  margin-top: 24px;
}

.places-list h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.place-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.place-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.place-name {
  font-weight: 600;
}

.place-id {
  font-weight: 500;
}
</style>

