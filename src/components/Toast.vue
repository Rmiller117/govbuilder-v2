<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <div v-if="message" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-60">
      <div class="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm">
        Success {{ message }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
</script>