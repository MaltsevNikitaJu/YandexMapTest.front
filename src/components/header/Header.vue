<template>
    <header class="header">
        <div class="header-content">
            <img class="header-logo" src="../../static/img/Daily-Grow-icon.svg" alt="Daily Grow" />
            <h1 class="header-title">Daily Grow</h1>
        </div>
        <div class="header-actions">
            <button v-if="user" class="header-button danger" @click="handleLogout" :disabled="isLoading">
                {{ isLoading ? 'Выходим...' : 'Выйти' }}
            </button>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AuthApi } from '@/api/auth.api'
import { UserApi, type UserProfile } from '@/api/user.api'
import { PlacesApi } from '@/api/places.api'

const router = useRouter()
const authApi = AuthApi.getInstance()
const userApi = UserApi.getInstance()
const placesApi = PlacesApi.getInstance()

const user = ref<UserProfile | null>(null)
const isLoading = ref(false)

onMounted(async () => {
    user.value = await userApi.auth()
})

async function handleLogout() {
    if (isLoading.value) return

    isLoading.value = true
    try {
        await authApi.logout()
        userApi.setCachedUser(null)
        placesApi.clearReviewsCache()
        user.value = null
        router.push('/login')
    } catch (error) {
        console.error('Ошибка при выходе:', error)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
@import "./Header.css";
</style>