<!-- src/App.vue — THE ONLY VERSION THAT NEVER JERKS -->
<template>
  <div class="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))] transition-colors duration-300">
    <!-- Custom Title Bar -->
    <TitleBar />
    
    <!-- Main content area -->
    <div class="h-screen pt-8">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@/components/TitleBar.vue'
</script>

<style scoped>
/* SOFT fade transition — less jarring than slide */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
}

.page-enter-to {
  opacity: 1;
}

.page-leave-from {
  opacity: 1;
}

.page-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}
</style>