<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <nav class="text-sm text-slate-500 mb-2">
              <button @click="router.push('/')" class="hover:text-slate-700 flex items-center gap-1 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
              </button>
            </nav>
            <div>
              <h1 class="text-3xl font-bold text-slate-900">
                {{ currentProjectName || 'Loading...' }}
              </h1>
              <p class="text-lg text-slate-600 mt-1">Configure your government workflow templates</p>
            </div>
          </div>
          <div class="flex items-center justify-end">
            <span class="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
              <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Active Project
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-10">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Workflow Configuration</h2>
        <p class="text-slate-600 max-w-3xl">Manage your project's workflow templates including case statuses, workflows, and other essential configuration elements.</p>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Case Statuses Card -->
        <router-link
          to="/statuses"
          class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200 hover:border-blue-300 h-full flex flex-col"
        >
          <div class="p-6 flex-grow">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-blue-100 rounded-lg mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">Case Statuses</h3>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              Define statuses like "In Review", "Approved", notifications, and Liquid templates
            </p>
          </div>
          <div class="bg-slate-50 px-6 py-3 text-right border-t border-slate-100">
            <span class="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">Edit Statuses →</span>
          </div>
        </router-link>

        <!-- Case Workflows Card -->
        <router-link
          to="/case-workflows"
          class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200 hover:border-blue-300 h-full flex flex-col"
        >
          <div class="p-6 flex-grow">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-blue-100 rounded-lg mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">Case Workflows</h3>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              Automate status transitions, assignments, and notifications
            </p>
          </div>
          <div class="bg-slate-50 px-6 py-3 text-right border-t border-slate-100">
            <span class="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">Edit Workflows →</span>
          </div>
        </router-link>

        <!-- License Statuses Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 opacity-50 h-full flex flex-col">
          <div class="p-6 flex-grow">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-purple-100 rounded-lg mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">License Statuses</h3>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              Manage license-specific statuses and renewal workflows
            </p>
          </div>
          <div class="bg-purple-50 px-6 py-3 text-right border-t border-purple-100">
            <span class="text-sm font-medium text-purple-600">Coming Soon</span>
          </div>
        </div>

        <!-- License Workflows Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 opacity-50 h-full flex flex-col">
          <div class="p-6 flex-grow">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-amber-100 rounded-lg mr-4">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">License Workflows</h3>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              Set up renewal reminders, expirations, and compliance flows
            </p>
          </div>
          <div class="bg-amber-50 px-6 py-3 text-right border-t border-amber-100">
            <span class="text-sm font-medium text-amber-600">Coming Soon</span>
          </div>
        </div>

        <!-- Inspection Types Card -->
        <router-link
          to="/inspection-types"
          class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200 hover:border-blue-300 h-full flex flex-col"
        >
          <div class="p-6 flex-grow">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-rose-100 rounded-lg mr-4">
                <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">Inspection Types</h3>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              Define inspection categories, required docs, and scheduling rules
            </p>
          </div>
          <div class="bg-slate-50 px-6 py-3 text-right border-t border-slate-100">
            <span class="text-sm font-medium text-rose-600 group-hover:text-rose-700 transition-colors">Edit Inspection Types →</span>
          </div>
        </router-link>

        <!-- Accounting Details Card -->
        <router-link
          to="/accounting"
          class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200 hover:border-blue-300 h-full flex flex-col"
        >
          <div class="p-6 flex-grow">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-indigo-100 rounded-lg mr-4">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">Accounting Details</h3>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              Fee schedules, payment types, refund rules, and GL codes
            </p>
          </div>
          <div class="bg-slate-50 px-6 py-3 text-right border-t border-slate-100">
            <span class="text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">Edit Accounting →</span>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/* ------------------------------------------------------------------ */
/*  Imports                                                            */
/* ------------------------------------------------------------------ */
import { useProjectStore } from '@/stores/projectStore'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/* ------------------------------------------------------------------ */
/*  Store – expose only what the template needs                        */
/* ------------------------------------------------------------------ */
const store = useProjectStore()
const router = useRouter()

// ── Project name (from JSON or fallback) ─────────────────────────────
const currentProjectName = computed(() => {
  return store.current?.data.name ?? null
})

// ── Full config object (the whole JSON) ──────────────────────────────

/* ------------------------------------------------------------------ */
/*  Lifecycle – make sure recent‑projects list is loaded               */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  await store.scanProjects()
  // If we landed here without a loaded project (e.g. direct URL), go home
  if (!store.current) {
    router.replace('/')
  }
})
</script>

<style scoped>
/* Additional styling for better visual consistency */
.router-link-active {
  text-decoration: none;
}
</style>