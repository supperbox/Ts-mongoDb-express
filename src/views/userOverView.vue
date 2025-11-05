<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'

const store = useUserInfoStore()
const loading = ref(false)
const showModal = ref(false)
const name = ref('')
const age = ref('')
const interests = ref('')

async function load() {
  loading.value = true
  setTimeout(() => {
    try {
      store.getAllUserInfo()
    } finally {
      loading.value = false
    }
  }, 500) // 保证加载动画至少显示 500ms
}

onMounted(() => {
  // 加载用户信息
  load()
})

// 获取姓名首字母作为头像
function getInitials(user) {
  const name = user?.name || user?.username || ''
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// 将 interests（可能是字符串数组或对象数组）转换为字符串数组
function normalizeInterests(user) {
  const raw = user?.interests
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') return item.name ?? String(item)
        return String(item)
      })
      .filter(Boolean)
  }
  // 如果传来逗号分隔的字符串也兼容
  if (typeof raw === 'string')
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  return []
}

// 返回前 n 个标签与剩余数量
function splitTags(tags, n = 3) {
  const visible = tags.slice(0, n)
  const more = Math.max(0, tags.length - visible.length)
  return { visible, more }
}

// 返回格式化后的 id（过长时使用省略号），若无 id 返回 '-'
function formatId(user, maxLen = 12) {
  const id = user?._id ?? user?.id ?? ''
  if (!id) return '-'
  const s = String(id)
  if (s.length <= maxLen) return s
  // 显示前6位 + ... + 后4位
  const head = s.slice(0, 6)
  const tail = s.slice(-4)
  return `${head}...${tail}`
}

// 新增：编辑弹窗状态与表单
const editModalVisible = ref(false)
const editForm = reactive({
  _id: '',
  name: '',
  age: '',
  interests: '',
})

// 打开编辑弹窗并填充数据
function openEdit(user) {
  editForm._id = user._id ?? user.id ?? ''
  editForm.name = user.name ?? user.username ?? ''
  editForm.age = user.age ?? ''
  editForm.interests = normalizeInterests(user).join(', ')
  editModalVisible.value = true
}

function closeEdit() {
  editModalVisible.value = false
  // 清空表单（可选）
  editForm._id = ''
  editForm.name = ''
  editForm.age = ''
  editForm.interests = ''
}

// 提交编辑：优先调用 store.updateUser，如不存在则打印（方便后续接后端）
async function submitEdit() {
  try {
    loading.value = true
    const payload = {
      name: editForm.name,
      age: editForm.age,
      interests: editForm.interests
        ? editForm.interests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    }

    if (typeof store.updateUser === 'function') {
      await store.updateUser(editForm, payload)
    } else {
      console.log('[updateUser placeholder]', editForm._id, payload)
    }

    // 刷新列表 重新获取所有数据
    await store.getAllUserInfo()
  } catch (err) {
    console.error('更新用户失败', err)
  } finally {
    loading.value = false
    closeEdit()
  }
}

// 新增：删除弹窗状态与目标
const deleteModalVisible = ref(false)
const deleteTarget = reactive({ _id: '', name: '', age: '', interests: '' })

function openDelete(user) {
  deleteTarget._id = user._id ?? user.id ?? ''
  deleteTarget.name = user.name ?? user.username ?? deleteTarget._id
  deleteModalVisible.value = true
}

function closeDelete() {
  deleteModalVisible.value = false
  deleteTarget._id = ''
  deleteTarget.name = ''
}

async function confirmDelete() {
  if (!deleteTarget._id) return closeDelete()
  try {
    loading.value = true
    if (typeof store.deleteUser === 'function') {
      await store.deleteUser(deleteTarget)
    } else {
      // 占位逻辑，替换为实际 API 调用 / store 方法
      console.log('[deleteUser placeholder]', deleteTarget._id)
    }
    // 刷新列表
    await store.getAllUserInfo()
  } catch (err) {
    console.error('删除用户失败', err)
  } finally {
    loading.value = false
    closeDelete()
  }
}

// 新建用户处理逻辑
function closeModal() {
  showModal.value = false
  name.value = ''
  age.value = ''
  interests.value = ''
}

function handleCreateUser() {
  store.createNewUser({ name: name.value, age: age.value, interests: interests.value })
  closeModal()
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto font-sans text-gray-800">
    <header class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-blue-700">用户概览</h2>
      <div class="flex items-center gap-2">
        <button
          class="px-4 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60"
          @click="load"
          :disabled="loading"
        >
          <span v-if="!loading">刷新</span>
          <span
            v-else
            class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full inline-block"
          ></span>
        </button>
      </div>
    </header>

    <main>
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-2">
        <span
          class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full inline-block"
        ></span>
        <span class="text-gray-400 text-sm">加载中……</span>
      </div>

      <div
        v-else-if="!store.allUserInfo || store.allUserInfo.length === 0"
        class="flex flex-col items-center justify-center py-16 text-gray-400"
      >
        暂无用户数据
      </div>

      <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <li
          v-for="(user, idx) in store.allUserInfo"
          :key="user._id || idx"
          class="flex gap-4 p-5 rounded-xl bg-white border shadow hover:shadow-lg transition"
        >
          <div
            class="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white font-bold text-lg shadow-inner"
            :title="user.name || user.username"
          >
            {{ getInitials(user) }}
          </div>
          <div class="flex-1 flex flex-col justify-between">
            <div class="flex justify-between items-center">
              <div class="font-semibold text-lg text-gray-900">
                {{ user.name ?? user.username ?? '未命名用户' }}
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="truncate max-w-[120px]" :title="user._id ?? user.id ?? '-'"
                  >ID: {{ formatId(user) }}</span
                >
                <button
                  class="px-2 py-1 rounded bg-gray-100 border text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                  @click="openEdit(user)"
                >
                  修改
                </button>
                <button
                  class="px-2 py-1 rounded bg-red-100 border text-red-700 hover:bg-red-200 transition"
                  @click="openDelete(user)"
                >
                  删除
                </button>
              </div>
            </div>
            <div class="flex gap-6 mt-2 text-sm">
              <div>
                <span class="text-gray-400">年龄：</span>
                <span class="font-medium">{{ user.age ?? '-' }}</span>
              </div>
              <div>
                <span class="text-gray-400">其他：</span>
                <span class="font-medium">{{ user.role ?? '-' }}</span>
              </div>
            </div>
            <div class="mt-2">
              <span class="text-gray-400 text-xs">爱好：</span>
              <span
                v-if="normalizeInterests(user).length === 0"
                class="inline-block px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs ml-2"
                >无</span
              >
              <template v-else>
                <span
                  v-for="(tag, i) in splitTags(normalizeInterests(user), 3).visible"
                  :key="i"
                  class="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs ml-2"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="splitTags(normalizeInterests(user), 3).more > 0"
                  class="inline-block px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs ml-2 font-semibold"
                >
                  +{{ splitTags(normalizeInterests(user), 3).more }}
                </span>
              </template>
            </div>
          </div>
        </li>
      </ul>

      <!-- 新增用户按钮 -->
      <div class="flex justify-end mt-8">
        <button
          @click="showModal = true"
          class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          新增用户
        </button>
      </div>

      <!-- 新建用户弹窗 -->
      <Transition name="modal-fade">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-lg font-semibold text-gray-800">新建用户</span>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">
                &times;
              </button>
            </div>
            <form @submit.prevent="handleCreateUser" class="flex flex-col gap-4">
              <input
                v-model="name"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="姓名"
                required
              />
              <input
                v-model.number="age"
                type="number"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="年龄"
                required
              />
              <input
                v-model="interests"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="兴趣（逗号分隔）"
              />
              <button
                type="submit"
                class="py-2 rounded bg-gradient-to-r from-blue-600 to-green-500 text-white hover:opacity-95"
              >
                创建用户
              </button>
            </form>
          </div>
        </div>
      </Transition>

      <!-- 编辑弹窗 -->
      <div
        v-if="editModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">编辑用户</h3>
          <form @submit.prevent="submitEdit" class="flex flex-col gap-4">
            <label class="flex flex-col gap-2 text-sm text-gray-700">
              姓名
              <input
                v-model="editForm.name"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </label>
            <label class="flex flex-col gap-2 text-sm text-gray-700">
              年龄
              <input
                v-model.number="editForm.age"
                type="number"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </label>
            <label class="flex flex-col gap-2 text-sm text-gray-700">
              爱好（逗号分隔）
              <input
                v-model="editForm.interests"
                class="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </label>
            <div class="flex justify-end gap-3 mt-2">
              <button
                type="button"
                class="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                @click="closeEdit"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                :disabled="loading"
              >
                <span v-if="!loading">保存</span>
                <span
                  v-else
                  class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full inline-block"
                ></span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 删除确认弹窗 -->
      <div
        v-if="deleteModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">确认删除</h3>
          <div class="mb-4 text-gray-700">
            确定要删除用户 <strong>{{ deleteTarget.name }}</strong>
            <span class="text-gray-400 ml-2">(ID: {{ deleteTarget._id }})</span>
            吗？此操作不可恢复。
          </div>
          <div class="flex justify-end gap-3 mt-2">
            <button
              type="button"
              class="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              @click="closeDelete"
            >
              取消
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              @click="confirmDelete"
              :disabled="loading"
            >
              <span v-if="!loading">删除</span>
              <span
                v-else
                class="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full inline-block"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 仅用于弹窗过渡动画，其他样式全部由 TailwindCSS 实现 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
