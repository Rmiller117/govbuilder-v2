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
            <div v-if="stagingUrl" class="mt-3 flex items-center gap-2">
              <span class="text-sm text-[rgb(var(--text-muted))]">Staging URL:</span>
              <button 
                @click="openStagingUrl"
                class="bg-[rgb(var(--bg))] px-3 py-1 rounded-lg border border-base text-sm font-mono text-primary hover:bg-[rgb(var(--bg-hover))] transition cursor-pointer"
              >
                {{ stagingUrl }}
              </button>
            </div>
          </div>

          <div class="flex items-center gap-5">
            <!-- Active Project Badge -->
            <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                         bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              <CheckCircleIcon class="w-4.5 h-4.5" />
              Active Project
            </span>

            <!-- Configure Staging URL Button -->
            <button @click="showStagingUrlModal = true"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300
                     hover:bg-blue-200 dark:hover:bg-blue-900/60 transition">
              <CogIcon class="w-4 h-4" />
              {{ stagingUrl ? 'Edit' : 'Add' }} Staging URL
            </button>

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
        <div class="group block">
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
            <div class="px-7 py-4 border-t border-base bg-[rgb(var(--bg))/0.03] space-y-3">
              <router-link to="/case-workflows" class="flex items-center justify-between text-primary font-medium px-3 py-2 rounded-lg hover:bg-[rgb(var(--primary))/0.1] transition-all group">
                <span>Edit Workflows</span>
                <ArrowRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </router-link>
              <router-link to="/case-export" class="flex items-center justify-between text-purple-600 dark:text-purple-400 font-medium px-3 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all group">
                <span class="flex items-center gap-2">
                  <RocketLaunchIcon class="w-4 h-4" />
                  Export Wizard
                </span>
                <ArrowRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </router-link>
            </div>
          </div>
        </div>

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

    <!-- Staging URL Modal -->
    <Modal :open="showStagingUrlModal" @close="showStagingUrlModal = false">
      <template #title>
        {{ stagingUrl ? 'Edit' : 'Add' }} Staging URL
      </template>
      
      <div class="space-y-6">
        <div>
          <label for="staging-url" class="block text-sm font-medium text-[rgb(var(--text))] mb-2">
            Base Staging URL
          </label>
          <input
            id="staging-url"
            v-model="tempStagingUrl"
            type="url"
            placeholder="https://your-staging-site.com"
            class="w-full px-4 py-3 rounded-xl border border-base bg-surface
                   placeholder:text-[rgb(var(--text-muted))/0.5]
                   text-[rgb(var(--text))]
                   focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))/0.5] ring-focus"
          />
          <p class="mt-2 text-sm text-[rgb(var(--text-muted))]">
            Enter the base URL for your staging site. This will be used for API connections and exports.
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-base">
          <button
            @click="showStagingUrlModal = false"
            class="px-6 py-2.5 rounded-xl font-medium text-[rgb(var(--text))]
                   bg-[rgb(var(--surface))] border border-base
                   hover:bg-[rgb(var(--surface-hover))] transition">
            Cancel
          </button>
          <button
            @click="saveStagingUrl"
            :disabled="!tempStagingUrl.trim()"
            class="px-6 py-2.5 rounded-xl font-medium text-white
                   bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-hover))]
                   disabled:opacity-50 disabled:cursor-not-allowed transition">
            {{ stagingUrl ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/stores/projectStore'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { invoke } from '@tauri-apps/api/core'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import Modal from '@/components/Modal.vue'

// Heroicons
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  HomeModernIcon,
  CurrencyDollarIcon,
  CogIcon,
  RocketLaunchIcon
} from '@heroicons/vue/24/outline'

const store = useProjectStore()
const router = useRouter()

const currentProjectName = computed(() => store.current?.data.name ?? null)
const stagingUrl = computed(() => store.stagingUrl)

const showStagingUrlModal = ref(false)
const tempStagingUrl = ref('')

// Watch for staging URL changes to sync with modal
watch(() => stagingUrl.value, (newUrl) => {
  tempStagingUrl.value = newUrl || ''
})

onMounted(async () => {
  await store.scanProjects()
  if (!store.current) router.replace('/')
  // Show modal if no staging URL is set
  else if (!stagingUrl.value) {
    showStagingUrlModal.value = true
  }
})

async function saveStagingUrl() {
  if (!tempStagingUrl.value.trim()) return
  
  try {
    await store.updateStagingUrl(tempStagingUrl.value.trim())
    showStagingUrlModal.value = false
  } catch (error) {
    console.error('Failed to save staging URL:', error)
    alert('Failed to save staging URL. Please try again.')
  }
}

async function openStagingUrl() {
  if (!stagingUrl.value) return
  
  try {
    await invoke('open_url', { url: stagingUrl.value })
  } catch (error) {
    console.error('Failed to open URL:', error)
  }
}
</script>