<script setup>
import { ref, onMounted } from 'vue'
import imagesApi from '../api/imagesApi.js'

const { uploadSingleFile, uploadBatchFiles, getFileList, getDownloadUrl, deleteImageFile } =
  imagesApi

const uploadMode = ref('single')
const selectedFiles = ref([])
const uploadProgress = ref(0)
const uploading = ref(false)
const fileList = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPages = ref(1)

// 单文件上传
async function handleUploadSingleFile(file) {
  uploading.value = true
  try {
    const data = await uploadSingleFile(file, (e) => {
      uploadProgress.value = Math.round((e.loaded * 100) / e.total)
    })
    return data
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 批量文件上传（分批处理）
async function handleUploadBatchFiles(files) {
  uploading.value = true
  const batchSize = 50 // 每批50个文件
  const totalBatches = Math.ceil(files.length / batchSize)

  try {
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, files.length)
      const batchFiles = files.slice(start, end)

      const data = await uploadBatchFiles(batchFiles, (e) => {
        const batchProgress = (i / totalBatches) * 100
        const currentProgress = (e.loaded / e.total) * (100 / totalBatches)
        uploadProgress.value = Math.round(batchProgress + currentProgress)
      })

      console.log(`已上传第 ${i + 1}/${totalBatches} 批，共 ${end} 个文件`)
    }
    return { message: `成功上传 ${files.length} 个文件` }
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 文件选择处理
function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])
  selectedFiles.value = files
}

// 执行上传
async function handleUpload() {
  if (selectedFiles.value.length === 0) {
    alert('请先选择文件')
    return
  }

  try {
    let result
    if (uploadMode.value === 'single' && selectedFiles.value.length === 1) {
      result = await handleUploadSingleFile(selectedFiles.value[0])
    } else {
      result = await handleUploadBatchFiles(selectedFiles.value)
    }
    alert(result.message)
    selectedFiles.value = []
    await loadFileList()
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  }
}

// 获取文件列表（分页）
async function loadFileList() {
  try {
    loading.value = true
    const { data } = await getFileList({ page: page.value, pageSize: pageSize.value })
    fileList.value = data.files || []
    total.value = data.pagination?.total || 0
    totalPages.value = data.pagination?.totalPages || 1
  } catch (error) {
    console.error('获取文件列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 翻页
function handlePageChange(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  loadFileList()
}

// 下载文件
function downloadFile(identifier) {
  window.open(getDownloadUrl(identifier), '_blank')
}

// 删除文件
async function handleDeleteFile(identifier) {
  if (!confirm(`确定要删除文件 ${identifier} 吗？`)) return

  try {
    await deleteImageFile(identifier)
    alert('删除成功')
    await loadFileList()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  }
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 格式化时间
function formatTime(date) {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadFileList()
})
</script>

<template>
  <div class="max-w-6xl mx-auto font-sans">
    <header class="mb-6">
      <h2 class="text-2xl font-bold text-blue-700">文件上传与管理</h2>
    </header>

    <!-- 上传区域 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700 mb-2 block">上传模式</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="uploadMode" value="single" class="w-4 h-4" />
            <span>单文件上传</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="uploadMode" value="batch" class="w-4 h-4" />
            <span>批量上传</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="uploadMode" value="folder" class="w-4 h-4" />
            <span>文件夹上传</span>
          </label>
        </div>
      </div>

      <div class="mb-4">
        <label class="block">
          <input
            type="file"
            :multiple="uploadMode !== 'single'"
            :webkitdirectory="uploadMode === 'folder'"
            :directory="uploadMode === 'folder'"
            @change="handleFileSelect"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </label>
        <div v-if="selectedFiles.length > 0" class="mt-2 text-sm text-gray-600">
          已选择 {{ selectedFiles.length }} 个文件
        </div>
      </div>

      <div v-if="uploading" class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="handleUpload"
          :disabled="uploading || selectedFiles.length === 0"
          class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ uploading ? '上传中...' : '开始上传' }}
        </button>
        <button
          @click="selectedFiles = []"
          :disabled="uploading"
          class="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition"
        >
          清空选择
        </button>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">已上传文件</h3>
        <button
          @click="loadFileList"
          :disabled="loading"
          class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm disabled:opacity-50"
        >
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-8 text-gray-400">加载中...</div>
      <div v-else-if="fileList.length === 0" class="text-center py-8 text-gray-400">暂无文件</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">文件名</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">大小</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">上传时间</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="file in fileList"
              :key="file.serialNumber || file.name"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-sm text-gray-900">{{ file.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatSize(file.size) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ formatTime(file.uploadTime) }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  @click="downloadFile(file.serialNumber || file.name)"
                  class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition mr-2"
                >
                  下载
                </button>
                <button
                  @click="handleDeleteFile(file.serialNumber || file.name)"
                  class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- 分页控件 -->
        <div class="flex justify-end items-center mt-4 gap-2" v-if="totalPages > 1">
          <button
            class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            :disabled="page === 1"
            @click="handlePageChange(page - 1)"
          >
            上一页
          </button>
          <span>第 {{ page }} / {{ totalPages }} 页</span>
          <button
            class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            :disabled="page === totalPages"
            @click="handlePageChange(page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 使用 Tailwind CSS，无需额外样式 */
</style>
