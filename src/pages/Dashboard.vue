<template>
  <!-- This div guarantees correct background forever, even when scrolling -->
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">

    <!-- Header -->
    <header class="bg-surface border-b border-base shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-7">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="flex-1">
            <!-- Back button -->
            <nav class="text-sm mb-3">
              <button @click="router.push('/')"
                class="inline-flex items-center gap-1.5 text-[rgb(var(--text-muted))] hover:text-primary transition">
                <ArrowLeftIcon class="w-4 h-4" />
                Back to Projects
              </button>
            </nav>

            <h1 class="text-3xl font-bold">{{ currentProjectName || 'Loading...' }}</h1>
            <p class="text-lg text-[rgb(var(--text-muted))] mt-1">
              Configure your government workflow templates
            </p>
          </div>

          <div class="flex items-center gap-5">
            <!-- Active Project Badge -->
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                         bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              <CheckCircleIcon class="w-4.5 h-4.5" />
              Active Project
            </span>

            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-10">
      <div class="mb-10">
        <h2 class="text-2xl font-bold mb-2">Workflow Configuration</h2>
        <p class="text-[rgb(var(--text-muted))] max-w-3xl">
          Manage your project's workflow templates including case statuses, workflows, and other essential configuration
          elements.
        </p>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        <!-- Case Statuses -->
        <router-link to="/statuses" class="group block">
          <div
            class="bg-surface rounded-2xl border border-base shadow-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div class="p-7 flex-grow">
              <div class="flex items-center mb-5">
                <div class="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                  <CheckCircleIcon class="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 class="text-xl font-bold ml-4">Case Statuses</h3>
              </div>
              <p class="text-[rgb(var(--text-muted))] text-sm leading-relaxed">
                Define statuses like "In Review", "Approved", notifications, and Liquid templates
              </p>
            </div>
            <div class="px-7 py-4 border-t border-base bg-[rgb(var(--bg))/0.03]">
              <span class="text-primary font-medium group-hover:translate-x-1 transition">Edit Statuses</span>
            </div>
          </div>
        </router-link>

        <!-- Case Workflows -->
        <router-link to="/case-workflows" class="group block">
          <div
            class="bg-surface rounded-2xl border border-base shadow-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div class="p-7 flex-grow">
              <div class="flex items-center mb-5">
                <div class="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                  <BoltIcon class="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 class="text-xl font-bold ml-4">Case Workflows</h3>
              </div>
              <p class="text-[rgb(var(--text-muted))] text-sm leading-relaxed">
                Automate status transitions, assignments, and notifications
              </p>
            </div>
            <div class="px-7 py-4 border-t border-base bg-[rgb(var(--bg))/0.03]">
              <span class="text-primary font-medium group-hover:translate-x-1 transition">Edit Workflows</span>
            </div>
          </div>
        </router-link>

        <!-- License Statuses -->
        <router-link to="/license-statuses" class="group block">
          <div
            class="bg-surface rounded-2xl border border-base shadow-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div class="p-7 flex-grow">
              <div class="flex items-center mb-5">
                <div class="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40">
                  <ShieldCheckIcon class="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="text-xl font-bold ml-4">License Statuses</h3>
              </div>
              <p class="text-[rgb(var(--text-muted))] text-sm leading-relaxed">
                Manage license-specific statuses and renewal workflows
              </p>
            </div>
            <div class="px-7 py-4 border-t border-base bg-[rgb(var(--bg))/0.03]">
              <span class="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-1 transition">Edit License Statuses</span>
            </div>
          </div>
        </router-link>

        <!-- License Workflows -->
        <router-link to="/license-workflows" class="group block">
          <div
            class="bg-surface rounded-2xl border border-base shadow-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div class="p-7 flex-grow">
              <div class="flex items-center mb-5">
                <div class="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <ClockIcon class="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 class="text-xl font-bold ml-4">License Workflows</h3>
              </div>
              <p class="text-[rgb(var(--text-muted))] text-sm leading-relaxed">
                Set up renewal reminders, expirations, and compliance flows
              </p>
            </div>
            <div class="px-7 py-4 border-t border-base bg-[rgb(var(--bg))/0.03]">
              <span class="text-amber-600 dark:text-amber-400 font-medium group-hover:translate-x-1 transition">Edit License Workflows</span>
            </div>
          </div>
        </router-link>

        <!-- Inspection Types -->
        <router-link to="/inspection-types" class="group block">
          <div
            class="bg-surface rounded-2xl border border-base shadow-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div class="p-7 flex-grow">
              <div class="flex items-center mb-5">
                <div class="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/40">
                  <HomeModernIcon class="w-7 h-7 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 class="text-xl font-bold ml-4">Inspection Types</h3>
              </div>
              <p class="text-[rgb(var(--text-muted))] text-sm leading-relaxed">
                Define inspection categories, required docs, and scheduling rules
              </p>
            </div>
            <div class="px-7 py-4 border-t border-base bg-[rgb(var(--bg))/0.03]">
              <span class="text-rose-600 dark:text-rose-400 font-medium group-hover:translate-x-1 transition">Edit
                Inspection Types</span>
            </div>
          </div>
        </router-link>

        <!-- Accounting Details -->
        <router-link to="/accounting" class="group block">
          <div
            class="bg-surface rounded-2xl border border-base shadow-base hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div class="p-7 flex-grow">
              <div class="flex items-center mb-5">
                <div class="p-3 rounded-xl bg-[rgb(var(--primary))/0.15]">
                  <CurrencyDollarIcon class="w-7 h-7 text-primary" />
                </div>
                <h3 class="text-xl font-bold ml-4">Accounting Details</h3>
              </div>
              <p class="text-[rgb(var(--text-muted))] text-sm leading-relaxed">
                Fee schedules, payment types, refund rules, and GL codes
              </p>
            </div>
            <div class="px-7 py-4 border-t border-base bg-[rgb(var(--bg))/0.03]">
              <span class="text-primary font-medium group-hover:translate-x-1 transition">Edit Accounting</span>
            </div>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// Heroicons
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  HomeModernIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const store = useProjectStore()
const router = useRouter()

const currentProjectName = computed(() => store.current?.data.name ?? null)

onMounted(async () => {
  await store.scanProjects()
  if (!store.current) router.replace('/')
})
</script>