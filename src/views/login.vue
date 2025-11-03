<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4 text-center">
        {{ mode === 'login' ? '用户登录' : '用户注册' }}
      </h2>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">账号</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入账号"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div v-if="error" class="text-sm text-red-500">
          {{ error }}
        </div>

        <div class="flex items-center justify-between">
          <label v-if="mode === 'login'" class="inline-flex items-center text-sm text-gray-600">
            <input type="checkbox" v-model="remember" class="form-checkbox h-4 w-4 text-blue-600" />
            <span class="ml-2">记住我</span>
          </label>
          <div class="text-sm">
            <button @click.prevent="toggleMode" class="text-blue-600 hover:underline">
              {{ mode === 'login' ? '去注册' : '去登录' }}
            </button>
          </div>
        </div>

        <div>
          <button
            :disabled="loading"
            type="submit"
            class="w-full py-2 rounded-md text-white bg-gradient-to-r from-blue-600 to-green-500 hover:opacity-95 disabled:opacity-60"
          >
            <span v-if="!loading">{{ mode === 'login' ? '登录' : '注册并登录' }}</span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              处理中...
            </span>
          </button>
        </div>
      </form>

      <p class="text-xs text-gray-400 mt-4 text-center">
        演示项目：注册信息保存在本地（localStorage），仅用于本地开发演示。
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')

const STORAGE_KEY = 'tslearn_users' // localStorage key

function loadUsers(): Record<string, { password: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUsers(map: Record<string, { password: string; createdAt: string }>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (e) {
    console.error('保存用户失败', e)
  }
}

function toggleMode() {
  error.value = ''
  mode.value = mode.value === 'login' ? 'register' : 'login'
  // 清空表单
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
}

// 登录流程（根据本地存储校验）
async function doLogin(name: string, pass: string) {
  const users = loadUsers()
  const record = users[name]
  if (!record) {
    throw new Error('用户未注册')
  }
  if (record.password !== pass) {
    throw new Error('密码错误')
  }
  // 登录成功：可在此保存登录状态（localStorage/session）或 token
  localStorage.setItem('tslearn_current_user', name)
  return true
}

// 注册流程（存入 localStorage）
async function doRegister(name: string, pass: string) {
  const users = loadUsers()
  if (users[name]) {
    throw new Error('该账号已被注册')
  }
  users[name] = { password: pass, createdAt: new Date().toISOString() }
  saveUsers(users)
  return true
}

async function onSubmit() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '账号和密码不能为空'
    return
  }
  if (mode.value === 'register') {
    if (password.value !== confirmPassword.value) {
      error.value = '两次输入的密码不一致'
      return
    }
  }

  loading.value = true
  try {
    // 模拟异步请求延迟
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (mode.value === 'login') {
      await doLogin(username.value.trim(), password.value)
      // 登录成功
      router.push({ path: '/' })
    } else {
      // 注册后自动登录
      await doRegister(username.value.trim(), password.value)
      await doLogin(username.value.trim(), password.value)
      router.push({ path: '/' })
    }
  } catch (e: any) {
    error.value = e?.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 以 Tailwind 为主，必要时在此添加小量自定义样式 */
</style>
