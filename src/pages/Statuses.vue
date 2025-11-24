<template>
  <div class="min-h-screen bg-bg text-[rgb(var(--text))]">
    <!-- Header -->
    <header class="bg-surface border-b border-base shadow-sm">
      <div class="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/Dashboard')"
            class="p-2 rounded-lg hover:bg-[rgb(var(--bg))] transition-colors"
            title="Go back"
          >
            <ArrowLeftIcon class="w-6 h-6" />
          </button>
          <h1 class="text-3xl font-bold">Statuses</h1>
        </div>

        <div class="flex items-center gap-4">
          <button
            @click="router.push('/statuses/new')"
            class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon class="w-5 h-5" />
            Add Status
          </button>
          <ThemeToggleButton />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-6 py-10">
      <!-- Status List Container -->
      <div class="bg-surface rounded-2xl shadow-lg border border-base overflow-hidden">
        <div v-if="!displayedStatuses.length" class="text-center py-20 px-8">
          <div class="bg-surface border border-base w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <DocumentTextIcon class="w-12 h-12 text-[rgb(var(--text-muted))]" />
          </div>
          <h3 class="text-xl font-semibold mb-2">No statuses yet</h3>
          <p class="text-[rgb(var(--text-muted))]">Create your first status to get started.</p>
        </div>

        <ul v-else class="divide-y divide-base">
          <li
            v-for="s in displayedStatuses"
            :key="s.id"
            class="group hover:bg-[rgb(var(--bg))] transition-colors"
          >
            <div
              class="px-8 py-6 flex items-center justify-between cursor-pointer"
              @click="router.push(`/statuses/${s.id}`)"
            >
              <div class="flex-1">
                <h3 class="text-lg font-medium">
                  {{ s.title?.trim() || "(Untitled status)" }}
                </h3>
                
                <!-- Notification Pills -->
                <div class="mt-3 flex flex-wrap gap-2">
                  <span 
                    v-if="s.notifyAssignedTeamMembers" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                  >
                    <UsersIcon class="w-3 h-3 mr-1" />
                    Team
                  </span>
                  
                  <span 
                    v-if="s.notifyApplicant" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                  >
                    <UserIcon class="w-3 h-3 mr-1" />
                    Applicant
                  </span>
                  
                  <span 
                    v-if="s.notifyOtherTeamMembers" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300"
                  >
                    <UserGroupIcon class="w-3 h-3 mr-1" />
                    Other Team
                  </span>
                  
                  <span 
                    v-if="s.notifyAllContacts" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
                  >
                    <UsersIcon class="w-3 h-3 mr-1" />
                    All Contacts
                  </span>
                  
                  <span 
                    v-if="s.notifyOtherRecipient" 
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300"
                  >
                    <EnvelopeIcon class="w-3 h-3 mr-1" />
                    Other Recipient
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- Hide from status flow chevron icon -->
                <div v-if="s.hideFromStatusFlowChevron" title="Hidden from status flow">
                  <EyeSlashIcon class="w-5 h-5 text-[rgb(var(--text-muted))]" />
                </div>

                <button
                  @click.stop="remove(s.id)"
                  class="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="Delete status"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>

                <ChevronRightIcon class="w-5 h-5 text-[rgb(var(--text-muted))]" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </main>
    <DashboardButton />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStatusStore } from '@/stores/statusStore'
import DashboardButton from '@/components/DashboardButton.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// Import Heroicons
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  DocumentTextIcon,
  UsersIcon,
  UserIcon,
  UserGroupIcon,
  EnvelopeIcon,
  EyeSlashIcon,
  TrashIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { list, remove } = useStatusStore()

// Safely filter + clean display
const displayedStatuses = computed(() => {
  const arr = Array.isArray(list.value) ? list.value : []
  return arr.filter((s: any) => s && s.id)  // hides totally broken entries
})
</script>
<style scoped>
/* Add some additional styling for better visual appeal */
.group:hover .status-title {
  color: #2563eb;
}
</style>