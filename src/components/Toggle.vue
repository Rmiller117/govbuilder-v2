<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <label class="relative inline-flex items-center cursor-pointer select-none">
    <!-- Hidden Checkbox -->
    <input
      type="checkbox"
      :checked="props.modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="sr-only peer"
    />

    <!-- Track -->
    <div
      class="
        w-14 h-8 rounded-full transition-colors
        bg-[rgb(var(--surface))] border border-base
        peer-checked:bg-[rgb(var(--primary))]
        peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--ring))/0.4]
      "
    ></div>

    <!-- Knob -->
    <div
      class="
        absolute top-0.5 left-0.5 h-7 w-7 rounded-full
        bg-[rgb(var(--bg))] border border-base transition-all
        peer-checked:left-[calc(100%-1.75rem)]
      "
    ></div>
  </label>
</template>
