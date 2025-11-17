<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <nav class="text-sm text-slate-500 mb-2">
              <button @click="router.back()" class="hover:text-slate-700 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
              </button>
            </nav>
            <h1 class="text-4xl font-bold text-slate-900">
              {{ currentProjectName || 'Loading...' }}
            </h1>
            <p class="text-lg text-slate-600 mt-2">Configure your government workflow templates</p>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Active Project
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Grid -->
    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <!-- Case Statuses -->
        <router-link
          to="/statuses"
          class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition"></div>
          <div class="p-10 text-center relative">
            <h3 class="text-3xl font-bold text-slate-800 mb-3">Case Statuses</h3>
            <p class="text-slate-600 text-base leading-relaxed">
              Define statuses like "In Review", "Approved", notifications, and Liquid templates
            </p>
          </div>
          <div class="bg-blue-50 text-blue-700 px-6 py-4 text-sm font-medium border-t border-blue-100">
            Edit Statuses →
          </div>
        </router-link>

        <!-- License Statuses -->
        <router-link
          to="/license-statuses"
          class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 opacity-75"
        >
          <div class="p-10 text-center">
            <h3 class="text-3xl font-bold text-slate-800 mb-3">License Statuses</h3>
            <p class="text-slate-600 text-base leading-relaxed">
              Manage license-specific statuses and renewal workflows
            </p>
          </div>
          <div class="bg-purple-50 text-purple-700 px-6 py-4 text-sm font-medium border-t border-purple-100">
            Coming Soon
          </div>
        </router-link>

        <!-- Case Workflows -->
        <router-link
          to="/case-workflows"
          class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 opacity-75"
        >
          <div class="p-10 text-center">
            <h3 class="text-3xl font-bold text-slate-800 mb-3">Case Workflows</h3>
            <p class="text-slate-600 text-base leading-relaxed">
              Automate status transitions, assignments, and notifications
            </p>
          </div>
          <div class="bg-emerald-50 text-emerald-700 px-6 py-4 text-sm font-medium border-t border-emerald-100">
            Coming Soon
          </div>
        </router-link>

        <!-- License Workflows -->
        <router-link
          to="/license-workflows"
          class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 opacity-75"
        >
          <div class="p-10 text-center">
            <h3 class="text-3xl font-bold text-slate-800 mb-3">License Workflows</h3>
            <p class="text-slate-600 text-base leading-relaxed">
              Set up renewal reminders, expirations, and compliance flows
            </p>
          </div>
          <div class="bg-amber-50 text-amber-700 px-6 py-4 text-sm font-medium border-t border-amber-100">
            Coming Soon
          </div>
        </router-link>

        <!-- Inspection Types -->
        <router-link
          to="/inspection-types"
          class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 opacity-75"
        >
          <div class="p-10 text-center">
            <h3 class="text-3xl font-bold text-slate-800 mb-3">Inspection Types</h3>
            <p class="text-slate-600 text-base leading-relaxed">
              Define inspection categories, required docs, and scheduling rules
            </p>
          </div>
          <div class="bg-rose-50 text-rose-700 px-6 py-4 text-sm font-medium border-t border-rose-100">
            Coming Soon
          </div>
        </router-link>

        <!-- Accounting Details -->
        <router-link
          to="/accounting"
          class="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 opacity-75"
        >
          <div class="p-10 text-center">
            <h3 class="text-3xl font-bold text-slate-800 mb-3">Accounting Details</h3>
            <p class="text-slate-600 text-base leading-relaxed">
              Fee schedules, payment types, refund rules, and GL codes
            </p>
          </div>
          <div class="bg-indigo-50 text-indigo-700 px-6 py-4 text-sm font-medium border-t border-indigo-100">
            Coming Soon
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
const currentConfig = computed(() => {
  return store.current?.data ?? {}
})

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