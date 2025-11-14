import { readonly, ref } from 'vue'

export interface Status {
  id: string
  title: string
  email: string
}

const list = ref<Status[]>([])

export function useStatusStore() {
  function setList(newList: Status[]) {
    list.value = newList
  }
  function add(item: Omit<Status, 'id'>) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    list.value.push({ ...item, id })
  }
  function update(id: string, updates: Partial<Status>) {
    const idx = list.value.findIndex((s) => s.id === id)
    if (idx > -1) list.value[idx] = { ...list.value[idx], ...updates }
  }
  function remove(id: string) {
    list.value = list.value.filter((s) => s.id !== id)
  }

  return { list: readonly(list), setList, add, update, remove }
}