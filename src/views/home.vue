<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'

const projectDescription = ref('Practice my TypeScript and Vue3 skills with this project.')
const features = ref([
  'Something funny',
  'fantastic TypeScript support',
  'Vue 3 + Vite + Pinia + Vue Router',
  'Tailwind CSS for styling',
])

// 组件加载时，首先获取所有的用户信息；
onMounted(() => {
  const store = useUserInfoStore()
  store.getAllUserInfo()
})

const name = ref('')
const age = ref('')
const interests = ref('')
</script>

<template>
  <!-- 新增：顶部导航 -->
  <header class="home-topnav">
    <div class="topnav-inner">
      <div class="brand">TSLearn</div>
      <nav class="links">
        <router-link to="/userOverView" class="link">用户概览</router-link>
        <!-- 未来可放其它入口 -->
      </nav>
    </div>
  </header>

  <div class="home">
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

  <div class="user-form-card">
    <div class="form-title">创建新用户</div>
    <form @submit.prevent="store.createNewUser({ name, age, interests })" class="user-form">
      <input v-model="name" class="form-input" placeholder="姓名" required />
      <input v-model.number="age" type="number" class="form-input" placeholder="年龄" required />
      <input v-model="interests" class="form-input" placeholder="兴趣（逗号分隔）" />
      <button type="submit" class="form-btn">创建用户</button>
    </form>
  </div>
</template>

<style scoped>
/* 新增顶部导航样式 */
.home-topnav {
  width: 100%;
  background: linear-gradient(90deg, #ffffff, #f8fafc);
  border-bottom: 1px solid #eceff3;
}
.topnav-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  font-weight: 700;
  color: #1f2937;
}
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

/* 表单美化样式 */
.user-form-card {
  max-width: 400px;
  margin: 40px auto 0 auto;
  padding: 30px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 18px;
  font-weight: bold;
}

.user-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #0984e3;
}

.form-btn {
  padding: 10px 0;
  background: linear-gradient(90deg, #0984e3 0%, #00b894 100%);
  color: #fff;
  font-size: 1.05rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.form-btn:hover {
  background: linear-gradient(90deg, #00b894 0%, #0984e3 100%);
}
</style>
