import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Statuses from '@/pages/Statuses.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/statuses', name: 'Statuses', component: Statuses }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})