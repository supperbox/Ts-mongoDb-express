<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { useLoginStore } from '../stores/loginStore'
import { useRouter } from 'vue-router'

const projectDescription = ref('Practice my TypeScript and Vue3 skills with this project.')
const features = ref([
  'Something funny',
  'fantastic TypeScript support',
  'Vue 3 + Vite + Pinia + Vue Router',
  'Tailwind CSS for styling',
])

// 组件加载时，首先获取所有的用户信息；
const store = useUserInfoStore()
onMounted(() => {
  store.getAllUserInfo()
})

const loginStore = useLoginStore()
const router = useRouter()
const account = loginStore.account

function logout() {
  loginStore.logout()
  router.push('/login')
}

const name = ref('')
const age = ref('')
const interests = ref('')
</script>

<template>
  <!-- 主体内容 -->
  <div class="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
    <h1 class="title">首页</h1>
    <div class="description">
      <p>{{ projectDescription }}</p>
      <ul>
        <li v-for="(feature, index) in features" :key="index">
          {{ feature }}
        </li>
      </ul>
    </div>
  </div>

  <div class="flex gap-[20px]">
    <div
      class="px-2 sm:px-2 md:px-3 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
    >
      Fantastic
    </div>
    <RotatingText
      :texts="['webSite', 'Man!']"
      mainClassName="px-2 sm:px-2 md:px-3 bg-green-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
      staggerFrom="last"
      :initial="{ y: '100%' }"
      :animate="{ y: 0 }"
      :exit="{ y: '-120%' }"
      :staggerDuration="0.025"
      splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
      :transition="{ type: 'spring', damping: 30, stiffness: 400 }"
      :rotationInterval="2000"
    />
  </div>
</template>

<style scoped>
/* 主要使用 TailwindCSS，无需自定义样式 */
.links {
  display: flex;
  gap: 10px;
  align-items: center;
}
.link {
  padding: 6px 12px;
  border-radius: 8px;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
}
.link:hover {
  background: #eef2f7;
  color: #0f1724;
}

.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.title {
  font-size: 2rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}

.description {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.description p {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.description ul {
  list-style-type: disc;
  padding-left: 20px;
}

.description li {
  font-size: 1rem;
  color: #34495e;
  margin-bottom: 10px;
}
</style>
