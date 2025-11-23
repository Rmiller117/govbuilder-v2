<template>
    <button @click="toggleTheme" :disabled="refreshing"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" class="relative p-2.5 rounded-xl transition-all duration-300
           bg-[rgb(var(--bg))] text-[rgb(var(--text))]
           border border-gray-300 dark:border-slate-600
           hover:shadow-lg hover:scale-110 active:scale-95
           disabled:opacity-50 disabled:cursor-not-allowed">
        <!-- Sun (Light Mode) -->
        <SunIcon v-if="!isDark && !refreshing" class="w-5 h-5" />

        <!-- Moon (Dark Mode) -->
        <MoonIcon v-if="isDark && !refreshing" class="w-5 h-5" />

        <!-- Spinner -->
        <svg v-if="refreshing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" />
            <path class="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const refreshing = ref(false)
const isDark = ref(false)          // ← this is now a ref we control

function toggleTheme() {
    refreshing.value = true

    // Toggle the class
    document.documentElement.classList.toggle('dark')

    // Update our reactive ref
    isDark.value = document.documentElement.classList.contains('dark')

    // Save to localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')

    setTimeout(() => (refreshing.value = false), 250)
}

// Apply saved or system preference on mount
onMounted(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark')
        isDark.value = true
    } else {
        document.documentElement.classList.remove('dark')
        isDark.value = false
    }
})
</script>