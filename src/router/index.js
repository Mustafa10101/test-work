import { createRouter, createWebHistory } from 'vue-router'
import VideoBanner from '@/views/VideoBanner.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'VideoBanner',
      component: VideoBanner
    }
  ]
})

export default router
