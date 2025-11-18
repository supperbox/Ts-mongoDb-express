import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/layout.vue'
import Home from '@/views/home.vue'
import userOverView from '@/views/userOverView.vue'
import Login from '@/views/login.vue'
import Shudu from '@/views/shudu.vue'
import FileUpload from '@/views/fileUpload.vue'
import ImagesShow from '@/views/imagesShow.vue' // 新增

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
          path: 'fileUpload', // 确保路径与导航栏一致
          name: 'FileUpload',
          component: FileUpload,
        },
        {
          path: 'imagesShow',
          name: 'ImagesShow',
          component: ImagesShow,
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
