<template>
  <TransitionRoot :show="open" appear>
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <!-- Overlay -->
      <TransitionChild
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <!-- Use variable-based backdrop for dark mode support -->
        <div class="fixed inset-0 bg-[rgb(var(--bg)/0.6)] backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:scale-95"
          >
            <DialogPanel
              class="w-full max-w-7xl rounded-3xl bg-surface p-8 shadow-lg border border-base"
            >
              <!-- Title -->
              <h3 class="text-2xl font-bold mb-6 text-[rgb(var(--text))]">
                <slot name="title" />
              </h3>

              <!-- Content -->
              <slot />
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue'

defineProps<{ open: boolean }>()
defineEmits(['close'])
</script>
