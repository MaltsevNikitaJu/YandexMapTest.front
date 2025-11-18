<template>
  <router-view />
</template>
<script setup lang="ts">
</script>
<style scoped>
:global(body) {
  margin: 0;
  min-height: 100vh;
}

.layout {
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
  background: #ffffff;
}
</style>
