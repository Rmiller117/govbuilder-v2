<template>
  <button
    @click="copy"
    class="group flex items-center justify-between w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-all text-left"
    :title="desc || tag"
  >
    <div>
      <code class="font-mono text-purple-800 font-semibold">{{ tag }}</code>
      <span v-if="desc" class="block text-xs text-purple-600 mt-1">{{ desc }}</span>
    </div>
    <svg class="w-5 h-5 text-purple-500 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  tag: string
  desc?: string
}>()

const emit = defineEmits<{
  copied: [tag: string]
}>()

async function copy() {
  await navigator.clipboard.writeText(`{{${props.tag}}}`)
  emit('copied', props.tag)
}
</script>