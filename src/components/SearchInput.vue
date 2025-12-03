<template>
  <div class="relative">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-muted))]" />
      <input
        ref="inputRef"
        v-model="internalValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full pl-10 pr-10 py-2.5 bg-[rgb(var(--bg))] border border-base rounded-lg text-[rgb(var(--text))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        :class="{
          'opacity-50 cursor-not-allowed': disabled,
          'text-sm': size === 'small',
          'text-base': size === 'medium',
          'text-lg': size === 'large'
        }"
        @input="handleInput"
        @keydown.escape="clearSearch"
      />
      <button
        v-if="showClear && internalValue"
        @click="clearSearch"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-[rgb(var(--surface))] transition-colors"
        title="Clear search"
      >
        <XMarkIcon class="w-4 h-4 text-[rgb(var(--text-muted))]" />
      </button>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
      <div class="animate-spin w-4 h-4 border-2 border-[rgb(var(--text-muted))] border-t-transparent rounded-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue?: string
  placeholder?: string
  debounceMs?: number
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  showClear?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search...',
  debounceMs: 300,
  size: 'medium',
  disabled: false,
  loading: false,
  showClear: true
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const internalValue = ref(props.modelValue)
let debounceTimer: NodeJS.Timeout | null = null

// Watch for external model value changes
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

// Handle input with debouncing
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  internalValue.value = target.value
  
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Set new timer
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', internalValue.value)
    emit('search', internalValue.value)
  }, props.debounceMs)
}

function clearSearch() {
  internalValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  emit('search', '')
  
  // Focus the input after clearing
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Expose methods for parent components
defineExpose({
  focus: () => inputRef.value?.focus(),
  clear: clearSearch
})
</script>