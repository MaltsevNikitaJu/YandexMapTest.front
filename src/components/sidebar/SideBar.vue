<template>
    <aside class="sidebar">
        <div class="sidebar-user">{{ props.userName }}</div>
        <div class="sidebar-content">
            <div class="sidebar-item">
                <img class="sidebar-item-icon" src="../../static/img/Repair-Tool.svg" alt="Отзывы" />
                <h2 class="sidebar-item-text">Отзывы</h2>
            </div>
            <div class="sidebar-buttons">
                <button
                    v-for="button in buttons"
                    :key="button.path"
                    class="sidebar-button"
                    :class="{ active: isActive(button.path) }"
                    type="button"
                    @click="navigate(button.path)"
                >
                    {{ button.label }}
                </button>
            </div>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    userName: {
        type: String,
        required: false,
    },
});

const router = useRouter();
const route = useRoute();

const buttons = [
    { label: 'Отзывы', path: '/reviews' },
    { label: 'Настройка', path: '/settings' },
];

function navigate(path: string) {
    if (route.path !== path) {
        router.push(path);
    }
}

function isActive(path: string) {
    return route.path === path;
}
</script>

<style scoped>
@import './SideBar.css';
</style>