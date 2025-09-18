<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { getUserInfo } from '@/api/home.js'

const projectDescription = ref('Practice my TypeScript and Vue3 skills with this project.')
const features = ref([
  'Something funny',
  'fantastic TypeScript support',
  'Vue 3 + Vite + Pinia + Vue Router',
  'Tailwind CSS for styling',
])

onMounted(() => {
  getUserInfo().then((data) => {
    console.log('User Info:', data)
  })
})
</script>

<template>
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
</template>

<style scoped>
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
