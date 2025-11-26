<template>
  <div class="space-y-5">
    <!-- Main Toggle + Label -->
    <div class="flex items-center justify-between">
      <label class="text-sm font-semibold text-[rgb(var(--text))] select-none">
        {{ label }}
      </label>
      <Toggle v-model="enabled" />
    </div>

    <!-- Custom Email Subject and Body (only appears when enabled) -->
    <Transition name="fade-slide">
      <div v-if="enabled" class="space-y-4 pl-1">
        <!-- Email Subject -->
        <div>
          <label class="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
            Email Subject
          </label>
          <input
            ref="subjectTextareaRef"
            v-model="localSubject"
            @blur="onSubjectBlur"
            placeholder="Enter email subject..."
            class="
              w-full px-5 py-3 text-sm rounded-xl
              bg-[rgb(var(--surface))]
              text-[rgb(var(--text))]
              placeholder-[rgb(var(--text-muted))]
              border border-base
              focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))/0.5)]
              transition-all
            "
          />
        </div>

        <!-- Email Body -->
        <div class="relative">
          <label class="block text-sm font-medium mb-2 text-[rgb(var(--text))]">
            Email Body
          </label>
          <CodeEditor
            ref="bodyEditorRef"
            v-model="localBody"
            @focus="handleFocus"
            @blur="onBlur"
            placeholder="Your custom email content..."
            :protect-template="true"
            :template-start="TEMPLATE_START"
            :template-end="TEMPLATE_END"
            :show-line-numbers="false"
          />

          <!-- Template badge -->
          <div class="absolute bottom-4 right-4">
            <span
              class="
                text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur
                bg-[rgb(var(--elevated)/0.9))]
                text-[rgb(var(--text-muted))]
              "
            >
              &lt;HTML and Liquid Supported&gt;
            </span>
          </div>
        </div>

        <!-- Quick Insert Pills -->
        <div class="space-y-2">
          <div class="text-xs font-medium text-[rgb(var(--text-muted))]">Quick Insert:</div>
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-base scrollbar-track-transparent">
            <button
              v-for="pill in quickInsertPills"
              :key="pill.tag"
              type="button"
              @click="insertAtCursor(pill.tag, pill.strong)"
              class="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full
                     bg-[rgb(var(--elevated))] 
                     text-[rgb(var(--text))]
                     border border-base
                     hover:bg-[rgb(var(--primary))] hover:text-[rgb(var(--bg))]
                     transition-colors cursor-pointer"
            >
              {{ pill.label }}
            </button>
          </div>
        </div>

        <!-- Footer info -->
        <div class="flex justify-between items-center text-xs text-[rgb(var(--text-muted))]">
          <span v-if="localBody.trim()">
            {{ localBody.length }} characters
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Toggle from '@/components/Toggle.vue'
import CodeEditor from '@/components/CodeEditor.vue'

const props = defineProps<{
  label: string
  modelValue: boolean
  emailBody?: string | null
  emailSubject?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:email-body': [value: string | undefined]
  'update:email-subject': [value: string | undefined]
}>()

const enabled = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const localBody = ref<string>(props.emailBody ?? '<emailTemplate></emailTemplate>')
const localSubject = ref<string>(props.emailSubject ?? '')
const bodyEditorRef = ref<InstanceType<typeof CodeEditor>>()
const subjectTextareaRef = ref<HTMLInputElement>()

const TEMPLATE_START = '<emailTemplate>'
const TEMPLATE_END = '</emailTemplate>'



const quickInsertPills = [
  { tag: 'Number', label: 'Number', strong: true },
  { tag: 'Location', label: 'Location', strong: false },
  { tag: 'CaseType', label: 'Case Type', strong: false },
  { tag: 'SubTypes', label: 'SubType', strong: false },
  { tag: 'ProfileCaseLink', label: 'ProfileCaseLink', strong: false },
  { tag: 'ProfileAdminLink', label: 'ProfileAdminLink', strong: false },
]

function handleFocus() {
  // Ensure template exists
  if (!localBody.value.includes(TEMPLATE_START)) {
    localBody.value = TEMPLATE_START + TEMPLATE_END
  }
  
  // Position cursor after the closing tag
  nextTick(() => {
    const startPos = localBody.value.length
    bodyEditorRef.value?.setCursor(startPos)
  })
}



function onBlur() {
  // Always emit the current value, even if it's just the template
  emit('update:email-body', localBody.value)
}

function onSubjectBlur() {
  const trimmed = localSubject.value.trim()
  if (!trimmed) {
    localSubject.value = ''
    emit('update:email-subject', undefined)
  } else {
    emit('update:email-subject', localSubject.value)
  }
}

watch(() => props.emailBody, (newVal) => {
  if (newVal && newVal.includes(TEMPLATE_START) && newVal.includes(TEMPLATE_END)) {
    localBody.value = newVal
  } else if (newVal) {
    // If the value doesn't have template tags, wrap it
    localBody.value = TEMPLATE_START + newVal + TEMPLATE_END
  } else {
    localBody.value = TEMPLATE_START + TEMPLATE_END
  }
})

watch(() => props.emailSubject, (newVal) => {
  localSubject.value = newVal ?? ''
})

function insertAtCursor(tag: string, useStrong: boolean) {
  const liquidTag = useStrong ? `<strong>{{${tag}}}</strong>` : `{{${tag}}}`
  
  // Check if subject field has focus
  const subjectElement = document.activeElement
  if (subjectElement === subjectTextareaRef.value) {
    // Insert into subject field
    const start = subjectTextareaRef.value?.selectionStart || 0
    const end = subjectTextareaRef.value?.selectionEnd || 0
    const currentValue = localSubject.value
    
    const newValue = currentValue.substring(0, start) + liquidTag + currentValue.substring(end)
    localSubject.value = newValue
    
    nextTick(() => {
      const newCursorPos = start + liquidTag.length
      subjectTextareaRef.value?.setSelectionRange(newCursorPos, newCursorPos)
    })
    return
  }
  
    // Default to body editor
  if (bodyEditorRef.value) {
    bodyEditorRef.value.focus()
    
    const currentPos = bodyEditorRef.value.getCursor() || 0
    const templateEnd = localBody.value.length
    const insertPos = Math.max(currentPos, templateEnd)
    
    // Insert the liquid tag at cursor position
    const newValue = localBody.value.substring(0, insertPos) + liquidTag + localBody.value.substring(insertPos)
    localBody.value = newValue
    
    // Set cursor position after the inserted text
    nextTick(() => {
      const newCursorPos = insertPos + liquidTag.length
      bodyEditorRef.value?.setCursor(newCursorPos)
    })
  }
}
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
