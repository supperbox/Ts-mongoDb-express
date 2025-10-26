import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import userOverView from '@/views/userOverView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/userOverView',
      name: 'userOverView',
      component: userOverView,
    },
  ],
})

export default router
