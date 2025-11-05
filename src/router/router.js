import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/layout.vue'
import Home from '../views/home.vue'
import userOverView from '@/views/userOverView.vue'
import NavBar from '../views/navbar.vue'
import Login from '../views/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'Home',
          component: Home,
        },
        {
          path: 'home',
          name: 'HomePage',
          component: Home,
        },
        {
          path: 'userOverView',
          name: 'userOverView',
          component: userOverView,
        },
        {
          path: 'nav',
          name: 'NavBar',
          component: NavBar,
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
  ],
})

export default router
