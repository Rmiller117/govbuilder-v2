<template>
  <div 
    class="fixed top-0 left-0 right-0 h-8 bg-surface border-b border-base z-50 flex items-center justify-between px-4"
    style="-webkit-app-region: drag"
  >
    <!-- Left side - drag area -->
    <div class="flex-1 flex items-center gap-3">
      <div class="w-6 h-6 flex items-center justify-center">
        <img src="/tauri.svg" alt="GovBuilder" class="w-5 h-5" />
      </div>
      <span class="text-sm font-medium text-[rgb(var(--text))]">GovBuilder</span>
    </div>

    <!-- Right side - window controls -->
    <div class="flex items-center gap-1">
      <button
        @click="minimizeWindow"
        class="w-8 h-6 flex items-center justify-center hover:bg-[rgb(var(--bg))] transition rounded"
        title="Minimize"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14" />
        </svg>
      </button>
      
      <button
        @click="maximizeWindow"
        class="w-8 h-6 flex items-center justify-center hover:bg-[rgb(var(--bg))] transition rounded"
        title="Maximize"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8h16M4 16h16" />
        </svg>
      </button>
      
      <button
        @click="closeWindow"
        class="w-8 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white transition rounded"
        title="Close"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Window } from '@tauri-apps/api/window'

// Get the current window (synchronous)
const mainWindow = Window.getCurrent()

async function minimizeWindow() {
  await mainWindow.minimize()
}

async function maximizeWindow() {
  const isMaximized = await mainWindow.isMaximized()
  if (isMaximized) {
    await mainWindow.unmaximize()
  } else {
    await mainWindow.maximize()
  }
}

async function closeWindow() {
  await mainWindow.close()
}
</script>

<style scoped>
/* Make window controls non-draggable */
button {
  -webkit-app-region: no-drag;
}

/* Custom scrollbar for title bar to prevent default */
::-webkit-scrollbar {
  display: none;
}
</style>