<template>
  <div class="home-page">
    <Header />
    <div class="main">
      <div class="sidebar-container">
        <SideBar :userName="user?.name" />
      </div>
      <div class="content-container">
        <RouterView v-slot="{ Component }">
          <component :is="Component" :user="user" />
        </RouterView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import Header from '../components/header/Header.vue'
import SideBar from '../components/sidebar/SideBar.vue'
import { UserApi, type UserProfile } from '@/api/user.api'

const router = useRouter()
const userApi = UserApi.getInstance()
const user = ref<UserProfile | null>(null)

onMounted(async () => {
  const authUser = await userApi.auth()
  if (!authUser) {
    router.push('/login')
  } else {
    user.value = authUser
  }
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  display: flex;
  flex: 1;
}

.sidebar-container {
  flex-shrink: 0;
}

.content-container {
  flex: 1;
  background-color: #ffffff;
}

.content {
  padding: 40px;
}

.content h1 {
  margin: 0 0 16px 0;
  font-size: 32px;
  color: #111827;
}

.content p {
  color: #6B7280;
  font-size: 16px;
}
</style>

