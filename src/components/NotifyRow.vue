<template>
  <div class="space-y-4">
    <!-- Toggle -->
    <ToggleRow :label="label" v-model="enabled" />

    <!-- Email body area – only when toggle is ON -->
    <transition name="fade">
      <div v-if="enabled" class="ml-10 space-y-3">
        <!-- Use default body checkbox -->
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="useDefault"
            class="w-5 h-5 text-blue-600 rounded"
          />
          <span class="text-sm">Use default email body</span>
        </label>

        <!-- Email body textarea -->
        <textarea
          v-model="emailBody"
          :placeholder="useDefault ? defaultBody : 'Write the email body that will be sent…'"
          rows="5"
          class="w-full p-3 border rounded-lg text-sm resize-none font-mono"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
/* ------------------------------------------------------------------ */
/*  Imports                                                            */
/* ------------------------------------------------------------------ */
import { computed, watch } from 'vue'
import ToggleRow from '@/components/ToggleRow.vue'

/* ------------------------------------------------------------------ */
/*  Default email body (edit once, used everywhere)                   */
/* ------------------------------------------------------------------ */
const DEFAULT_BODY = `{{CaseType}} #{{Number}} is now {{Status}}`

/* ------------------------------------------------------------------ */
/*  Props (creates the `props` variable)                              */
/* ------------------------------------------------------------------ */
const props = defineProps<{
  label: string
  modelValue: boolean          // toggle
  emailBody: string            // <-- now the body, not recipients
  useDefault: boolean
}>()

/* ------------------------------------------------------------------ */
/*  Emits                                                             */
/* ------------------------------------------------------------------ */
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'update:emailBody', v: string): void
  (e: 'update:useDefault', v: boolean): void
}>()

/* ------------------------------------------------------------------ */
/*  Two‑way bindings                                                  */
/* ------------------------------------------------------------------ */
const enabled = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const emailBody = computed({
  get: () => props.emailBody,
  set: v => emit('update:emailBody', v),
})

const useDefault = computed({
  get: () => props.useDefault,
  set: v => emit('update:useDefault', v),
})

/* ------------------------------------------------------------------ */
/*  Fill with default when checkbox is ticked                         */
/* ------------------------------------------------------------------ */
watch(useDefault, (val) => {
  if (val) emailBody.value = DEFAULT_BODY
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity .2s, transform .2s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>