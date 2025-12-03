<template>
  <div class="relative">
    <!-- Filter button -->
    <Menu as="div" class="relative">
      <MenuButton
        class="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--bg))] border border-base rounded-lg hover:bg-[rgb(var(--surface))] transition-colors"
        :class="{ 'ring-2 ring-blue-500': hasActiveFilters }"
      >
        <FunnelIcon class="w-5 h-5 text-[rgb(var(--text))]" />
        <span class="text-[rgb(var(--text))]">Filters</span>
        <span v-if="activeFilterCount > 0" class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
          {{ activeFilterCount }}
        </span>
        <ChevronDownIcon class="w-4 h-4 text-[rgb(var(--text-muted))]" />
      </MenuButton>

      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <MenuItems
          class="absolute right-0 mt-2 w-80 p-4 bg-elevated border border-base rounded-xl shadow-lg focus:outline-none z-50"
        >
          <!-- Filter groups -->
          <div class="space-y-4">
            <!-- Notification Type Filters -->
            <div v-if="showDefaultFilters && filterGroups.notificationTypes">
              <h4 class="text-sm font-medium text-[rgb(var(--text))] mb-2">Notification Types</h4>
              <div class="space-y-2">
                <label
                  v-for="option in filterGroups.notificationTypes.options"
                  :key="option.value"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(var(--bg))] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="isFilterActive('notificationTypes', option.value)"
                    @change="toggleFilter('notificationTypes', option.value)"
                    class="w-4 h-4 text-blue-600 bg-[rgb(var(--bg))] border-base rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div class="flex items-center gap-2 flex-1">
                    <component :is="option.icon" class="w-4 h-4" :class="option.iconClass" />
                    <span class="text-sm text-[rgb(var(--text))]">{{ option.label }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Status Visibility Filters -->
            <div v-if="showDefaultFilters && filterGroups.statusVisibility">
              <h4 class="text-sm font-medium text-[rgb(var(--text))] mb-2">Status Visibility</h4>
              <div class="space-y-2">
                <label
                  v-for="option in filterGroups.statusVisibility.options"
                  :key="option.value"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(var(--bg))] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="isFilterActive('statusVisibility', option.value)"
                    @change="toggleFilter('statusVisibility', option.value)"
                    class="w-4 h-4 text-blue-600 bg-[rgb(var(--bg))] border-base rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <component :is="option.icon" class="w-4 h-4" :class="option.iconClass" />
                  <span class="text-sm text-[rgb(var(--text))]">{{ option.label }}</span>
                </label>
              </div>
            </div>

            <!-- Custom filter groups -->
            <div v-for="(group, groupKey) in customFilterGroups" :key="groupKey">
              <h4 class="text-sm font-medium text-[rgb(var(--text))] mb-2">{{ group.title }}</h4>
              <div class="space-y-2">
                <label
                  v-for="option in group.options"
                  :key="option.value"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(var(--bg))] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="isFilterActive(groupKey, option.value)"
                    @change="toggleFilter(groupKey, option.value)"
                    class="w-4 h-4 text-blue-600 bg-[rgb(var(--bg))] border-base rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span class="text-sm text-[rgb(var(--text))]">{{ option.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center justify-between mt-6 pt-4 border-t border-base">
            <button
              @click="clearAllFilters"
              class="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors"
            >
              Clear all
            </button>
            <button
              @click="closeDropdown"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply filters
            </button>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'
import {
  FunnelIcon,
  ChevronDownIcon,
  UsersIcon,
  UserIcon,
  UserGroupIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

interface FilterOption {
  value: string
  label: string
  icon?: any
  iconClass?: string
}

interface FilterGroup {
  title: string
  options: FilterOption[]
}

interface Props {
  activeFilters?: Record<string, string[]>
  filterGroups?: {
    notificationTypes?: {
      options: FilterOption[]
    }
    statusVisibility?: {
      options: FilterOption[]
    }
  }
  customFilterGroups?: Record<string, FilterGroup>
  showDefaultFilters?: boolean
}

interface Emits {
  (e: 'filter-change', filters: Record<string, string[]>): void
  (e: 'filter-clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  activeFilters: () => ({}),
  showDefaultFilters: true,
  filterGroups: () => ({
    notificationTypes: {
      options: [
        { value: 'team', label: 'Team Members', icon: UsersIcon, iconClass: 'text-blue-500' },
        { value: 'applicant', label: 'Applicant', icon: UserIcon, iconClass: 'text-green-500' },
        { value: 'otherTeam', label: 'Other Team', icon: UserGroupIcon, iconClass: 'text-purple-500' },
        { value: 'allContacts', label: 'All Contacts', icon: UsersIcon, iconClass: 'text-yellow-500' },
        { value: 'otherRecipient', label: 'Other Recipient', icon: EnvelopeIcon, iconClass: 'text-red-500' }
      ]
    },
    statusVisibility: {
      options: [
        { value: 'visible', label: 'Visible in Status Flow', icon: EyeIcon, iconClass: 'text-green-500' },
        { value: 'hidden', label: 'Hidden from Status Flow', icon: EyeSlashIcon, iconClass: 'text-gray-500' }
      ]
    }
  })
})

const emit = defineEmits<Emits>()

// Computed properties
const activeFilterCount = computed(() => {
  return Object.values(props.activeFilters).reduce((total, filters) => total + filters.length, 0)
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

// Methods
function isFilterActive(groupKey: string, value: string): boolean {
  return props.activeFilters[groupKey]?.includes(value) || false
}

function toggleFilter(groupKey: string, value: string) {
  const currentFilters = { ...props.activeFilters }
  const groupFilters = currentFilters[groupKey] || []
  
  const index = groupFilters.indexOf(value)
  if (index > -1) {
    // Remove filter
    groupFilters.splice(index, 1)
  } else {
    // Add filter
    groupFilters.push(value)
  }
  
  // Update the filters object
  if (groupFilters.length === 0) {
    delete currentFilters[groupKey]
  } else {
    currentFilters[groupKey] = groupFilters
  }
  
  emit('filter-change', currentFilters)
}

function clearAllFilters() {
  emit('filter-clear')
}

function closeDropdown() {
  // Close the dropdown by blurring the menu button
  const menuButton = document.querySelector('[data-headlessui-state]') as HTMLElement
  menuButton?.blur()
}
</script>