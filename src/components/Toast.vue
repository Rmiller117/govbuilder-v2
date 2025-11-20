<template>
    <div v-if="message" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-60">
      <div class="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm">
        <CheckCircleIcon v-if="type === 'success'" class="w-5 h-5 text-green-400" />
        <ExclamationTriangleIcon v-else-if="type === 'error'" class="w-5 h-5 text-red-400" />
        <InformationCircleIcon v-else class="w-5 h-5 text-blue-400" />
        {{ message }}
      </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
}>()
</script>