// src/stores/statusStore.ts
import { computed, watch, ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'   // npm i uuid

export function useStatusStore() {
  const projectStore = useProjectStore()

  if (!projectStore.current) {
    console.warn('statusStore used without a loaded project')
  }

  // Navigation state
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(25)
  const activeFilters = ref<Record<string, string[]>>({})

  // Available page size options
  const pageSizeOptions = [10, 25, 50, 100]
// Set up the status array in our overall project store (Idk what I'm doing, I'm used to databases lol)
const statuses = computed({
    get: () => {
      if (!projectStore.current?.data.govData?.projectBuild) {
        return []
      }
      if (!Array.isArray(projectStore.current.data.govData.projectBuild.statuses)) {
        projectStore.current.data.govData.projectBuild.statuses = []
      }
      return projectStore.current.data.govData.projectBuild.statuses
    },
    set: (val) => {
      if (!projectStore.current) return
      if (!projectStore.current.data.govData) {
        projectStore.current.data.govData = {}
      }
      if (!projectStore.current.data.govData.projectBuild) {
        projectStore.current.data.govData.projectBuild = {}
      }
      projectStore.current.data.govData.projectBuild.statuses = val
    },
  })

// Read-Only list we can use to view them on the statuses page and the workflow modal and stuff
  const list = computed(() => statuses.value)

  // Filter statuses based on search query and active filters
  const filteredStatuses = computed(() => {
    let filtered = [...statuses.value]

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter((status: any) => 
        status.title?.toLowerCase().includes(query)
      )
    }

    // Apply notification type filters
    if (activeFilters.value.notificationTypes?.length) {
      filtered = filtered.filter((status: any) => {
        return activeFilters.value.notificationTypes!.some((filterType: string) => {
          switch (filterType) {
            case 'team':
              return status.notifyAssignedTeamMembers
            case 'applicant':
              return status.notifyApplicant
            case 'otherTeam':
              return status.notifyOtherTeamMembers
            case 'allContacts':
              return status.notifyAllContacts
            case 'otherRecipient':
              return status.notifyOtherRecipient
            default:
              return false
          }
        })
      })
    }

    // Apply visibility filters
    if (activeFilters.value.statusVisibility?.length) {
      filtered = filtered.filter((status: any) => {
        return activeFilters.value.statusVisibility!.some((filterType: string) => {
          switch (filterType) {
            case 'visible':
              return !status.hideFromStatusFlowChevron
            case 'hidden':
              return status.hideFromStatusFlowChevron
            default:
              return false
          }
        })
      })
    }

    return filtered
  })

  // Paginated statuses for display
  const paginatedStatuses = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    return filteredStatuses.value.slice(startIndex, endIndex)
  })

  // Total pages
  const totalPages = computed(() => Math.ceil(filteredStatuses.value.length / pageSize.value) || 1)

  // Total filtered items
  const totalFilteredItems = computed(() => filteredStatuses.value.length)

 
  async function add(item: any) {
    statuses.value = [...statuses.value, { ...item, id: item.id || uuidv4() }]
    await projectStore.saveCurrent()   
  }

  async function update(id: string, data: Partial<any>) {
    statuses.value = statuses.value.map((s: any) =>
      s.id === id ? { ...s, ...data } : s
    )
    await projectStore.saveCurrent() 
  }

  async function remove(id: string) {
    statuses.value = statuses.value.filter((s: any) => s.id !== id)
    await projectStore.saveCurrent() 
  }

// Navigation actions
  function setSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page when searching
  }

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function setPageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1 // Reset to first page when changing page size
  }

  function setFilters(filters: Record<string, string[]>) {
    activeFilters.value = filters
    currentPage.value = 1 // Reset to first page when filtering
  }

  function clearFilters() {
    activeFilters.value = {}
    currentPage.value = 1 // Reset to first page when clearing filters
  }

  function resetNavigation() {
    searchQuery.value = ''
    currentPage.value = 1
    activeFilters.value = {}
  }

  // Creates a new status in the array and assigns our own uuid
  function createNew() {
    return {
      id: uuidv4(), // Not a Govbuilt ID, although I should create a field for them now that sync exists
      govbuiltContentItemId: undefined, // Orchard Core ContentItemId for API sync
      title: '',
      hideFromStatusFlowChevron: false,
      notifyAssignedTeamMembers: false,
      notifyOtherTeamMembers: false,
      notifyApplicant: false,
      notifyAllContacts: false,
      notifyOtherRecipient: false,
      useDefaultAssignedTeamMembers: false,
      useDefaultOtherTeamMembers: false,
      useDefaultApplicant: false,
      useDefaultAllContacts: false,
      useDefaultOtherRecipient: false,
    }
  }

// Backup auto-save function. Idk if we even need this.
  watch(
    statuses,
    async () => {
      await projectStore.saveCurrent()
    },
    { deep: true }
  )
// Exports!
  return {
    // Original
    list,
    add,
    update,
    remove,
    createNew,
    
    // Navigation state
    searchQuery,
    currentPage,
    pageSize,
    activeFilters,
    pageSizeOptions,
    
    // Computed
    filteredStatuses,
    paginatedStatuses,
    totalPages,
    totalFilteredItems,
    
    // Navigation actions
    setSearchQuery,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
    resetNavigation,
  }
}