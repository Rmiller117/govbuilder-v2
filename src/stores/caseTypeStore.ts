// src/stores/caseTypeStore.ts
import { computed, watch, ref } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { v4 as uuidv4 } from 'uuid'

// In your CaseType interface
export interface CaseType {
  id: string
  govbuiltContentItemId?: string // Orchard Core ContentItemId for API sync
  title: string
  prefix?: string
  suffix?: string
  autoNumber: boolean
  autoLicense: boolean
  subtypes: string[]
  workflowId?: string  
}

export function useCaseTypeStore() {
  const projectStore = useProjectStore()

  if (!projectStore.current) {
    console.warn('caseTypeStore used without a loaded project')
  }

  // Navigation state
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(25)
  const activeFilters = ref<Record<string, string[]>>({})

  // Available page size options
  const pageSizeOptions = [10, 25, 50, 100]

const caseTypes = computed<CaseType[]>({
    get: () => {
      if (!projectStore.current?.data.govData?.projectBuild) {
        return []
      }
      if (!Array.isArray(projectStore.current.data.govData.projectBuild.caseTypes)) {
        projectStore.current.data.govData.projectBuild.caseTypes = []
      }
      return projectStore.current.data.govData.projectBuild.caseTypes
    },
    set: (val) => {
      if (!projectStore.current) return
      if (!projectStore.current.data.govData) {
        projectStore.current.data.govData = {}
      }
      if (!projectStore.current.data.govData.projectBuild) {
        projectStore.current.data.govData.projectBuild = {}
      }
      projectStore.current.data.govData.projectBuild.caseTypes = val
    },
  })

  const list = computed(() => caseTypes.value)

  // Filter case types based on search query and active filters
  const filteredCaseTypes = computed(() => {
    let filtered = [...caseTypes.value]

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter((caseType: CaseType) => 
        caseType.title?.toLowerCase().includes(query) ||
        caseType.prefix?.toLowerCase().includes(query) ||
        caseType.suffix?.toLowerCase().includes(query)
      )
    }

    // Apply workflow filters
    if (activeFilters.value.workflows?.length) {
      filtered = filtered.filter((caseType: CaseType) => {
        return activeFilters.value.workflows!.some((filterType: string) => {
          switch (filterType) {
            case 'withWorkflow':
              return !!caseType.workflowId
            case 'withoutWorkflow':
              return !caseType.workflowId
            default:
              return false
          }
        })
      })
    }

    // Apply auto-numbering filters
    if (activeFilters.value.autoNumbering?.length) {
      filtered = filtered.filter((caseType: CaseType) => {
        return activeFilters.value.autoNumbering!.some((filterType: string) => {
          switch (filterType) {
            case 'autoNumber':
              return caseType.autoNumber
            case 'manualNumber':
              return !caseType.autoNumber
            default:
              return false
          }
        })
      })
    }

    // Apply auto-license filters
    if (activeFilters.value.autoLicense?.length) {
      filtered = filtered.filter((caseType: CaseType) => {
        return activeFilters.value.autoLicense!.some((filterType: string) => {
          switch (filterType) {
            case 'autoLicense':
              return caseType.autoLicense
            case 'manualLicense':
              return !caseType.autoLicense
            default:
              return false
          }
        })
      })
    }

    // Apply subtype filters
    if (activeFilters.value.subtypes?.length) {
      filtered = filtered.filter((caseType: CaseType) => {
        return activeFilters.value.subtypes!.some((filterType: string) => {
          switch (filterType) {
            case 'withSubtypes':
              return caseType.subtypes && caseType.subtypes.length > 0
            case 'withoutSubtypes':
              return !caseType.subtypes || caseType.subtypes.length === 0
            default:
              return false
          }
        })
      })
    }

    return filtered
  })

  // Paginated case types for display
  const paginatedCaseTypes = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    return filteredCaseTypes.value.slice(startIndex, endIndex)
  })

  // Total pages
  const totalPages = computed(() => Math.ceil(filteredCaseTypes.value.length / pageSize.value) || 1)

  // Total filtered items
  const totalFilteredItems = computed(() => filteredCaseTypes.value.length)

  async function save(type: CaseType) {
    const existing = caseTypes.value.findIndex(t => t.id === type.id)
    if (existing >= 0) {
      caseTypes.value[existing] = { ...type }
    } else {
      caseTypes.value.push({ ...type, id: type.id || uuidv4() })
    }
    await projectStore.saveCurrent()
  }

async function remove(id: string) {
    caseTypes.value = caseTypes.value.filter(t => t.id !== id)
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

  watch(caseTypes, () => projectStore.saveCurrent(), { deep: true })

  return { 
    // Original
    list, 
    save, 
    remove,
    
    // Navigation state
    searchQuery,
    currentPage,
    pageSize,
    activeFilters,
    pageSizeOptions,
    
    // Computed
    filteredCaseTypes,
    paginatedCaseTypes,
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