import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  } as Crypto
}
import '@/assets/tailwind.css'

createApp(App).use(MotionPlugin).use(router).use(createPinia()).mount('#app')