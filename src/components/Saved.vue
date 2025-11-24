<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <div
      v-if="visible"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        class="
          px-6 py-3 rounded-full flex items-center gap-3 font-medium text-sm
          bg-[rgb(var(--elevated))]
          text-[rgb(var(--text))]
          shadow-lg border border-base
        "
      >
        <svg
          class="w-5 h-5 text-[rgb(var(--success))]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>

        Saved
        <code
          class="
            font-mono px-2 py-1 rounded
            bg-[rgb(var(--surface))]
            text-[rgb(var(--text))]
            border border-base
          "
        >
          {{ text }}
        </code>
        to project!
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  visible: boolean
}>()
</script>
