<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-3 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-3 scale-95"
  >
    <div
      v-if="message"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]"
    >
      <div
        class="
          px-6 py-3 rounded-full shadow-lg
          flex items-center gap-3 font-medium text-sm
          bg-[rgb(var(--elevated))]
          text-[rgb(var(--text))]
          border border-base backdrop-blur-md
        "
      >
        <!-- Icons with theme colors -->
        <CheckCircleIcon
          v-if="type === 'success'"
          class="w-5 h-5"
          :class="'text-[rgb(var(--success))]'"
        />

        <ExclamationTriangleIcon
          v-else-if="type === 'error'"
          class="w-5 h-5"
          :class="'text-[rgb(var(--danger))]'"
        />

        <InformationCircleIcon
          v-else
          class="w-5 h-5"
          :class="'text-[rgb(var(--primary))]'"
        />

        {{ message }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
}>()

defineEmits(['close'])
</script>
