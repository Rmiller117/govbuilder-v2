<script setup lang="ts">
import Toggle from './Toggle.vue'   // ← THIS LINE WAS MISSING

defineProps<{
  label: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <div class="flex items-center justify-between py-3">
    <div class=" flex items-center gap-3">
      <span class="text-lg font-medium text-gray-800">{{ label }}</span>
      <span class="text-gray-400 cursor-help text-sm" title="More info coming soon">ⓘ</span>
    </div>
    <Toggle
      :modelValue="modelValue"
      @update:modelValue="emit('update:modelValue', $event)"
    />
  </div>
</template>