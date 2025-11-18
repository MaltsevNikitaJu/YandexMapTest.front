<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="login-title">Daily Grow</h1>
      
      <div class="login-tabs">
        <button 
          :class="['tab-button', { active: isLogin }]"
          @click="isLogin = true"
        >
          Вход
        </button>
        <button 
          :class="['tab-button', { active: !isLogin }]"
          @click="isLogin = false"
        >
          Регистрация
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="!isLogin" class="form-group">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="Введите ваше имя"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="Введите email"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="Введите пароль"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="password_confirmation">Подтвердите пароль</label>
          <input
            id="password_confirmation"
            v-model="formData.password_confirmation"
            type="password"
            required
            placeholder="Повторите пароль"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading" class="submit-button">
          {{ isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { AuthApi, type RegisterPayload, type LoginPayload } from '@/api/auth.api'
import { UserApi } from '@/api/user.api'

const router = useRouter()
const authApi = AuthApi.getInstance()
const userApi = UserApi.getInstance()

const isLogin = ref(true)
const isLoading = ref(false)
const error = ref('')

const formData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (isLogin.value) {
      const loginData: LoginPayload = {
        email: formData.email,
        password: formData.password,
      }
      const { user } = await authApi.login(loginData)
      userApi.setCachedUser(user)
    } else {
      const registerData: RegisterPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      }
      const { user } = await authApi.register(registerData)
      userApi.setCachedUser(user)
    }

    router.push('/home')
  } catch (err: any) {
    const apiError = err.response?.data
    if (typeof apiError === 'string') {
      error.value = apiError
    } else if (apiError?.message) {
      error.value = apiError.message
    } else if (apiError?.errors) {
      error.value = JSON.stringify(apiError.errors)
    } else {
      error.value = 'Произошла ошибка. Проверьте введённые данные'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #F6F8FA;
}

.login-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.tab-button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #6B7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button.active {
  color: #2563EB;
  border-bottom-color: #2563EB;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input {
  padding: 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #2563EB;
}

.error-message {
  padding: 12px;
  background-color: #FEE2E2;
  color: #DC2626;
  border-radius: 8px;
  font-size: 14px;
}

.submit-button {
  padding: 12px;
  background-color: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #1D4ED8;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

