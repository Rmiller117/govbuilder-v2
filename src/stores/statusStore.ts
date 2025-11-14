import { computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'

export function useStatusStore() {
  const { currentConfig } = useProjectStore()

  const list = computed({
    get: () => currentConfig.statuses || [],
    set: (val) => currentConfig.statuses = val
  })

  function add(item: any) {
    list.value = [...list.value, item]
  }

  function update(id: string, data: any) {
    list.value = list.value.map((s: any) => s.id === id ? { ...s, ...data } : s)
  }

  function remove(id: string) {
    list.value = list.value.filter((s: any) => s.id !== id)
  }

  return {
    list: computed(() => list.value), // read-only for components
    add,
    update,
    remove
  }
}