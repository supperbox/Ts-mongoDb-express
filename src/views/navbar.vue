<template>
  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
    <section>
      <h2 class="text-xl font-semibold mb-4">快速入口</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <router-link
          to="/create"
          class="p-4 bg-white rounded-lg shadow-sm flex flex-col items-start hover:shadow-md"
        >
          <h3 class="font-medium mb-2">新建用户</h3>
          <p class="text-sm text-slate-500">跳转到新建用户页面（未实现）</p>
        </router-link>

        <router-link
          to="/list"
          class="p-4 bg-white rounded-lg shadow-sm flex flex-col items-start hover:shadow-md"
        >
          <h3 class="font-medium mb-2">查询用户</h3>
          <p class="text-sm text-slate-500">跳转到用户列表页面（未实现）</p>
        </router-link>

        <router-link
          to="/edit"
          class="p-4 bg-white rounded-lg shadow-sm flex flex-col items-start hover:shadow-md"
        >
          <h3 class="font-medium mb-2">修改用户</h3>
          <p class="text-sm text-slate-500">跳转到修改用户页面（未实现）</p>
        </router-link>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
// 此处保留为后续页面开发和接入路由预留
</script>

<style scoped>
/* 仅使用 Tailwind CSS，必要时在此添加少量自定义样式 */
</style>
