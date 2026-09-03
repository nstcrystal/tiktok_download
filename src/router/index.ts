import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/tiktok',
    },
    {
      path: '/tiktok',
      name: 'tiktok',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/youtube',
      name: 'youtube',
      component: () => import('@/views/YoutubePage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutPage.vue'),
    },
  ],
})

export default router
