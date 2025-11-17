<template>
  <div class="space-y-5">
    <!-- Main Toggle + Label -->
    <div class="flex items-center justify-between">
      <label class="text-sm font-semibold text-slate-700 select-none">
        {{ label }}
      </label>
      <Toggle v-model="enabled" />
    </div>

    <!-- Custom Email Body (only appears when enabled) -->
    <Transition name="fade-slide">
      <div v-if="enabled" class="space-y-4 pl-1">
        <div class="relative">
          <textarea
            v-model="localBody"
            @focus="ensureTemplate"
            @blur="onBlur"
            placeholder="Your custom email content..."
            rows="10"
            class="w-full px-5 py-4 font-mono text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical placeholder-slate-400"
          />
          <!-- Template badge -->
          <div class="absolute top-4 right-4">
            <span class="text-xs font-medium text-slate-500 bg-slate-200/90 px-3 py-1.5 rounded-full backdrop-blur">
              &lt;emailTemplate&gt;
            </span>
          </div>
        </div>

        <!-- Footer info -->
        <div class="flex justify-between items-center text-xs text-slate-500">
          <span v-if="localBody.trim()">
            {{ localBody.length }} characters
          </span>
          <span v-else class="italic">
            Template auto-inserted on first edit
          </span>
          <span class="font-medium text-blue-600">
            HTML supported
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Toggle from '@/components/Toggle.vue'

const props = defineProps<{
  label: string
  modelValue: boolean
  emailBody?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:email-body': [value: string | undefined]
}>()

const enabled = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const localBody = ref<string>(props.emailBody ?? '')

// Auto-insert <emailTemplate> on first focus
function ensureTemplate(e: FocusEvent) {
  if (!localBody.value.trim()) {
    const template = '<emailTemplate></emailTemplate>'
    localBody.value = template

    nextTick(() => {
      const el = e.target as HTMLTextAreaElement
      const pos = template.indexOf('>') + 1
      el.setSelectionRange(pos, pos)
      el.focus()
    })
  }
}

function onBlur() {
  const trimmed = localBody.value.trim()
  if (!trimmed || trimmed === '<emailTemplate></emailTemplate>') {
    localBody.value = ''
    emit('update:email-body', undefined)
  } else {
    emit('update:email-body', localBody.value)
  }
}

// Sync when parent updates
watch(() => props.emailBody, (newVal) => {
  localBody.value = newVal ?? ''
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s ease-out;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>