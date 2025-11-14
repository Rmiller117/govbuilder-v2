<template>
  <form @submit.prevent="emit('save', form)" class="space-y-4">
    <div>
      <label class="block font-medium mb-1">Title</label>
      <input v-model="form.title" required class="w-full border rounded px-3 py-2" />
    </div>

    <div>
      <label class="block font-medium mb-1">Email</label>
      <input v-model="form.email" type="email" required class="w-full border rounded px-3 py-2" />
    </div>

    <div class="flex justify-end space-x-2">
      <button type="button" @click="emit('cancel')" class="px-4 py-2 border rounded">Cancel</button>
      <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
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

watch(() => props.initial, (val) => {
  if (val) {
    form.value.title = val.title
    form.value.email = val.email
  } else {
    form.value.title = ''
    form.value.email = ''
  }
}, { immediate: true })
</script>