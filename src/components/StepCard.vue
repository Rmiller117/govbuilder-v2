<template>
  <div :style="cardStyle" class="absolute top-0 left-1/2 w-[95%] sm:w-[90%] -translate-x-1/2 bg-surface rounded-2xl border border-base shadow-base p-4 sm:p-8 max-h-[600px] overflow-y-auto">
    <h2 class="text-2xl font-bold mb-4 text-[rgb(var(--text))]">{{ title }}</h2>
    <p class="text-[rgb(var(--text-muted))] mb-6">
      {{ description }}
    </p>
    
    <!-- Alert Box -->
    <div v-if="alert" :class="alertClasses" class="rounded-lg p-4 mb-6">
      <div class="flex">
        <component :is="alertIcon" :class="`h-5 w-5 mt-0.5 ${alertIconColor}`" />
        <div class="ml-3">
          <h3 v-if="alertTitle" class="text-sm font-medium text-[rgb(var(--text))]">{{ alertTitle }}</h3>
          <p class="text-sm text-[rgb(var(--text-muted))]">
            <span v-if="!$slots.alertContent" v-html="alertContent"></span>
            <slot v-else name="alertContent"></slot>
          </p>
          <p v-if="alertLink" class="text-sm mt-2">
            <a @click="alertLink.onClick" class="text-[rgb(var(--primary))] hover:underline cursor-pointer">
              {{ alertLink.text }}
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Content Slot -->
    <slot></slot>

    <!-- Success Details -->
    <div v-if="showSuccessDetails && successDetails" class="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg p-4">
      <p class="text-sm font-medium mb-2 text-[rgb(var(--text))]">{{ successDetails.title }}</p>
      <div class="space-y-1">
        <div 
          v-for="(detail, index) in successDetails.items" 
          :key="detail.label" 
          class="text-sm text-[rgb(var(--text-muted))] fade-in-item"
          :style="{ animationDelay: `${index * 150}ms` }"
        >
          {{ detail.label }}: 
          <component 
            :is="detail.isLink ? 'a' : 'code'" 
            :href="detail.isLink ? detail.value : undefined"
            :class="detail.isLink ? 'text-[rgb(var(--primary))] hover:underline cursor-pointer' : 'bg-[rgb(var(--elevated))] px-1 rounded text-[rgb(var(--text))]'"            @click="detail.isLink && detail.onClick ? detail.onClick() : undefined"
          >
            {{ detail.displayValue || detail.value }}
          </component>
        </div>
      </div>
    </div>

    <!-- Checkbox for manual steps -->
    <div v-if="showCheckbox" class="mt-6 p-4 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg">
      <label class="flex items-start cursor-pointer">
        <input type="checkbox" :checked="checkboxChecked" @change="$emit('checkbox-change', ($event.target as HTMLInputElement).checked)" class="rounded border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))] focus:ring-2 w-4 h-4 mt-1">
        <span class="ml-3 text-sm text-[rgb(var(--text))] leading-relaxed">{{ checkboxLabel }}</span>
      </label>
    </div>

    <!-- Action Button -->
    <div v-if="actionLabel && status === 'pending'" class="space-y-4">
      <button @click="$emit('action')" :disabled="isGenerating"
        class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-hover))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <ArrowPathIcon v-if="isGenerating" class="animate-spin -ml-1 mr-2 h-4 w-4" />
        {{ actionLabel }}
      </button>
    </div>

    <!-- Generating State -->
    <div v-else-if="status === 'generating' || status === 'querying'" class="space-y-4">
      <div class="flex items-center">
        <ArrowPathIcon class="animate-spin h-5 w-5 text-[rgb(var(--primary))] mr-2" />
        <p class="text-sm text-[rgb(var(--text-muted))]">{{ 
          status === 'generating' ? 'Generating...' : 'Querying...' 
        }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="status === 'error'" class="space-y-4">
      <div class="flex items-center text-[rgb(var(--danger))]">
        <ExclamationTriangleIcon class="h-5 w-5 mr-2" />
        <p class="text-sm font-medium text-[rgb(var(--text))]">Error occurred</p>
      </div>
      <p v-if="error" class="text-sm text-[rgb(var(--danger))]">{{ error }}</p>
      <button @click="$emit('action')" :disabled="isGenerating"
        class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-[rgb(var(--danger))] hover:bg-[rgb(var(--danger))]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--danger))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  description: string
  stepIndex: number
  currentStepIndex: number
  status: 'pending' | 'generating' | 'querying' | 'success' | 'error'
  alert?: {
    type: 'info' | 'warning' | 'success'
    title?: string
    content: string
    link?: {
      text: string
      onClick: () => void
    }
  }
  successDetails?: {
    title: string
    items: Array<{ 
      label: string; 
      value: string; 
      displayValue?: string;
      isLink?: boolean; 
      onClick?: () => void;
    }>
  }
  showCheckbox?: boolean
  checkboxLabel?: string
  checkboxChecked?: boolean
  actionLabel?: string
  isGenerating?: boolean
  error?: string
}

interface Emits {
  (e: 'action'): void
  (e: 'checkbox-change', value: boolean): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Calculate card position and style for carousel effect
const cardStyle = computed(() => {
  const distance = props.stepIndex - props.currentStepIndex
  
  // Calculate transform based on distance from current step
  // Use percentage-based positioning that works better on mobile
  const translateX = distance * 100 // 100% offset between cards
  const scale = Math.max(0.7, 1 - Math.abs(distance) * 0.2) // Scale down distant cards but not too much
  const opacity = Math.max(0.3, 1 - Math.abs(distance) * 0.4) // Fade out distant cards but keep visible
  const zIndex = 10 - Math.abs(distance) // Layer cards properly
  
  return {
    transform: `translateX(${translateX}%) scale(${scale})`,
    opacity: opacity,
    zIndex: zIndex,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: (distance === 0 ? 'auto' : 'none') as 'auto' | 'none'
  }
})

// Alert styling
const alertClasses = computed(() => {
  if (!props.alert) return ''
  
  const baseClasses = 'border'
  switch (props.alert.type) {
    case 'info':
      return `${baseClasses} bg-[rgb(var(--primary))]/5 border-[rgb(var(--primary))]/30`
    case 'warning':
      return `${baseClasses} bg-[rgb(var(--primary))]/5 border-[rgb(var(--primary))]/30`
    case 'success':
      return `${baseClasses} bg-[rgb(var(--success))]/10 border-[rgb(var(--success))]/30`
    default:
      return `${baseClasses} bg-[rgb(var(--surface))] border-[rgb(var(--border))]`
  }
})

const alertIcon = computed(() => {
  if (!props.alert) return null
  
  switch (props.alert.type) {
    case 'info':
      return InformationCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'success':
      return CheckCircleIcon
    default:
      return InformationCircleIcon
  }
})

const alertIconColor = computed(() => {
  if (!props.alert) return ''
  
  switch (props.alert.type) {
    case 'info':
      return 'text-[rgb(var(--primary))]'
    case 'warning':
      return 'text-[rgb(var(--primary))]'
    case 'success':
      return 'text-[rgb(var(--success))]'
    default:
      return 'text-[rgb(var(--text-muted))]'
  }
})

const alertTitle = computed(() => props.alert?.title)
const alertContent = computed(() => props.alert?.content)
const alertLink = computed(() => props.alert?.link)

const showSuccessDetails = computed(() => props.status === 'success' && props.successDetails)
const showCheckbox = computed(() => props.showCheckbox)
</script>

<style scoped>
@keyframes fadeInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in-item {
  animation: fadeInFromLeft 0.5s ease-out forwards;
  opacity: 0;
}
</style>