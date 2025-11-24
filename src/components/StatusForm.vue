<template>
  <form @submit.prevent="emit('save', form)" class="space-y-6">

    <!-- Title -->
    <div>
      <label class="block font-semibold mb-2 text-[rgb(var(--text))]">
        Title
      </label>

      <input
        v-model="form.title"
        required
        class="
          w-full px-4 py-3 rounded-xl

          bg-[rgb(var(--surface))]
          text-[rgb(var(--text))]
          border border-base

          focus:outline-none
          focus:ring-2 focus:ring-[rgb(var(--ring))/0.5]

          placeholder-[rgb(var(--text-muted))]
          transition
        "
      />
    </div>

    <!-- Email -->
    <div>
      <label class="block font-semibold mb-2 text-[rgb(var(--text))]">
        Email
      </label>

      <input
        v-model="form.email"
        type="email"
        required
        class="
          w-full px-4 py-3 rounded-xl

          bg-[rgb(var(--surface))]
          text-[rgb(var(--text))]
          border border-base

          focus:outline-none
          focus:ring-2 focus:ring-[rgb(var(--ring))/0.5]

          placeholder-[rgb(var(--text-muted))]
          transition
        "
      />
    </div>

    <!-- Buttons -->
    <div class="flex justify-end gap-3 pt-4">
      <button
        type="button"
        @click="emit('cancel')"
        class="
          px-5 py-2.5 rounded-xl font-medium

          bg-[rgb(var(--bg))]
          text-[rgb(var(--text))]
          border border-base

          hover:bg-[rgb(var(--surface))]
          transition
        "
      >
        Cancel
      </button>

      <button
        type="submit"
        class="
          px-5 py-2.5 rounded-xl font-medium text-white

          bg-[rgb(var(--success))]
          hover:bg-[rgb(var(--success))]/90

          shadow-md transition
        "
      >
        {{ initial?.id ? 'Update' : 'Create' }}
      </button>
    </div>

  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ initial?: any }>()
const emit = defineEmits(['save', 'cancel'])

const form = ref({
  title: '',
  email: ''
})

watch(
  () => props.initial,
  (val) => {
    form.value = val
      ? { title: val.title, email: val.email }
      : { title: '', email: '' }
  },
  { immediate: true }
)
</script>
