<template>
  <router-link :to="to" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
    <div class="flex items-center space-x-4">
      <div class="text-4xl">{{ icon }}</div>
      <h2 class="text-xl font-semibold">{{ title }}</h2>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{ title: string; to: string; icon: string }>()
</script>