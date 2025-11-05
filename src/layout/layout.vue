<template>
  <div class="flex flex-col min-h-screen bg-gray-50 w-full">
    <!-- 顶部导航栏 -->
    <nav class="w-full bg-white shadow flex items-center justify-between px-6 py-3">
      <div class="flex items-center gap-6">
        <span class="text-xl font-bold text-blue-600">TsLearn Demo</span>
        <router-link
          to="/home"
          class="text-gray-700 hover:text-blue-600 px-2 py-1 rounded transition font-medium"
          active-class="text-blue-600 font-bold"
        >
          首页
        </router-link>
        <router-link
          to="/userOverView"
          class="text-gray-700 hover:text-blue-600 px-2 py-1 rounded transition font-medium"
          active-class="text-blue-600 font-bold"
        >
          账户概览
        </router-link>
        <!-- 可继续添加其他导航项 -->
      </div>
      <button
        @click="logout"
        class="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
      >
        登出
      </button>
    </nav>

    <!-- 主内容区域 -->
    <main class="flex-1 w-full max-w-5xl mx-auto py-8 px-4">
      <router-view />
    </main>

    <!-- 底部栏 -->
    <footer class="w-full bg-white border-t py-4 text-center text-xs text-gray-400">
      © 2024 TsLearn Demo. A fantastic project.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useLoginStore } from '../stores/loginStore'
import { useRouter } from 'vue-router'
// 可根据需要添加全局逻辑
const loginStore = useLoginStore()
const router = useRouter()
const account = loginStore.account

function logout() {
  loginStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* 主要使用 TailwindCSS，无需自定义样式 */
</style>
