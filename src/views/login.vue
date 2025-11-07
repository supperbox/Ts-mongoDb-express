<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="w-full min-w-[350px] max-w-md bg-white rounded-lg shadow-md p-8">
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
            <button type="button" @click.prevent="toggleMode" class="text-blue-600 hover:underline">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '../stores/loginStore'

const router = useRouter()
const loginStore = useLoginStore()

const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')

function rememberCredentials() {
  if (remember.value) {
    loginStore.username = username.value
    loginStore.password = password.value
  } else {
    loginStore.username = ''
    loginStore.password = ''
  }
}

// 记住我 功能实现
onMounted(() => {
  if (loginStore.username && loginStore.password) {
    username.value = loginStore.username
    password.value = loginStore.password
    remember.value = true
  }
})

function toggleMode() {
  error.value = ''
  mode.value = mode.value === 'login' ? 'register' : 'login'
  // 清空表单
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function isStrongPassword(pwd: string) {
  // 至少8位，包含字母和数字
  return pwd.length > 6 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd)
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
    if (!isStrongPassword(password.value)) {
      error.value = '密码需大于6位且包含数字和字母'
      return
    }
  }

  loading.value = true
  try {
    // 模拟异步请求延迟
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (mode.value === 'login') {
      await loginStore.login({ account: username.value.trim(), password: password.value })

      // 登录成功
      router.push({ path: '/home' })
      rememberCredentials()
    } else {
      // 注册后自动登录
      await loginStore.register({ account: username.value.trim(), password: password.value })
      await loginStore.login({ account: username.value.trim(), password: password.value })
      router.push({ path: '/home' })
      rememberCredentials()
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 以 Tailwind 为主，必要时在此添加小量自定义样式 */
</style>
