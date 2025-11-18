<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import imagesApi from '@/api/imagesApi'

interface ImageItemRaw {
  serialNumber: number
  name: string
  size: number
  path: string
  uploadTime: string
  mimeType: string
}

type ImageStatus = 'loading' | 'loaded' | 'error'

interface ImageItem extends ImageItemRaw {
  status: ImageStatus
  estimatedHeight: number
}

// 分页参数
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const noMore = ref(false)

// 两列瀑布流数据
const columns = reactive<[ImageItem[], ImageItem[]]>([[], []])
const columnHeights = reactive([0, 0])

/**
 * 将接口返回的原始数据包装为带状态的 ImageItem
 */
function normalizeItems(items: ImageItemRaw[]): ImageItem[] {
  return items.map((img) => {
    // 估算高度：基于大小 + 随机，制造错落感（单位像素）
    const base = 200
    // const bySize = Math.min(Math.max(img.size / 4096, 0), 160) // 0~160
    const jitter = Math.round(Math.random() * 500) // 0~80
    const estimatedHeight = base + jitter //
    return {
      ...img,
      status: 'loading',
      estimatedHeight,
    }
  })
}

// 将图片插入高度较低的列中
function pushToMasonryColumns(items: ImageItem[]) {
  items.forEach((img, index) => {
    const targetIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1
    columns[targetIndex].push(img)
    columnHeights[targetIndex] += img.estimatedHeight
  })
}

async function loadMore() {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await imagesApi.getFileList({
      page: page.value,
      pageSize: pageSize.value,
    })
    const list = res?.data?.files || res?.data?.data?.files || res?.data?.data || res?.files || []
    if (!Array.isArray(list) || list.length === 0) {
      noMore.value = true
      return
    }
    const normalized = normalizeItems(list)
    pushToMasonryColumns(normalized)
    page.value += 1
  } catch (e) {
    console.error('加载图片失败', e)
  } finally {
    loading.value = false
  }
}

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  loadMore()

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      })
    },
    {
      root: null,
      rootMargin: '200px', // 提前触发，减少空白风险
      threshold: 0,
    },
  )

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
})

onUnmounted(() => {
  if (observer && sentinelRef.value) observer.unobserve(sentinelRef.value)
  observer = null
})

/**
 * 图片加载成功：标记状态为 loaded，并微调高度（更接近真实）
 */
function handleImgLoad(item: ImageItem, e: Event) {
  const imgEl = e.target as HTMLImageElement
  item.status = 'loaded'
  // 如果能拿到真实高度，可以用真实高度去替换估算值，以后可作为优化：
  // const realHeight = imgEl.naturalHeight * (imgEl.clientWidth / imgEl.naturalWidth)
  // 暂不回写，以免闪动，只标记状态，视觉上已无空白问题
}

/**
 * 图片加载失败：标记为 error，显示一个占位块而不是空白
 */
function handleImgError(item: ImageItem) {
  item.status = 'error'
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto py-6">
    <div class="mb-4 text-lg font-semibold text-gray-700">图片展示</div>

    <!-- 瀑布流两列 -->
    <div class="grid grid-cols-2 gap-3 md:gap-4">
      <div v-for="(col, colIndex) in columns" :key="colIndex" class="flex flex-col gap-3 md:gap-4">
        <div
          v-for="item in col"
          :key="item.serialNumber"
          class="bg-white rounded-lg shadow-sm overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <!-- 高度由 estimatedHeight 控制：形成错落感 -->
          <div class="w-full relative overflow-hidden">
            <div class="w-full relative" :style="{ height: item.estimatedHeight + 'px' }">
              <!-- 占位层（skeleton），在 loading 或 error 时展示 -->
              <div
                v-if="item.status !== 'loaded'"
                class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center text-gray-400 text-xs"
              >
                {{ item.status === 'error' ? '加载失败' : '加载中...' }}
              </div>

              <!-- 真正的图片，覆盖在占位层上 -->
              <img
                :src="`http://localhost:3001/uploads/${item.name}`"
                :alt="item.name"
                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                :class="item.status === 'loaded' ? 'opacity-100' : 'opacity-0'"
                loading="lazy"
                @load="handleImgLoad(item, $event)"
                @error="handleImgError(item)"
              />
            </div>
          </div>

          <div class="px-3 py-2 text-xs text-gray-500 flex justify-between items-center">
            <span class="truncate max-w-[70%]" :title="item.name">{{ item.name }}</span>
            <span>{{ (item.size / 1024).toFixed(1) }} KB</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 / 底部锚点 -->
    <div ref="sentinelRef" class="mt-6 flex justify-center items-center text-sm text-gray-500">
      <span v-if="loading">加载中...</span>
      <span v-else-if="noMore">没有更多图片了</span>
      <span v-else>下拉加载更多</span>
    </div>
  </div>
</template>

<style scoped>
/* ...existing code... */
</style>
