<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
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

// 分页 / 加载
const page = ref(1)
const pageSize = ref(30)
const loading = ref(false)
const noMore = ref(false)

const justLoaded = ref(false) // 标记刚刚加载过一次

// 所有图片数据（扁平）
const allItems = reactive<ImageItem[]>([])

// 预估高度前缀和：heightsPrefixSum[i] = 前 i 个 item 的高度总和
const heightsPrefixSum = reactive<number[]>([0])
const totalHeight = ref(0)

// 虚拟窗口：只渲染 [visibleStartIndex, visibleEndIndex)
const visibleStartIndex = ref(0)
const visibleEndIndex = ref(0)
const VISIBLE_BUFFER = 10 // 上下各多渲染一些，避免频繁抖动
const MAX_VISIBLE_COUNT = 60 // 最大渲染条目数，防止 DOM 过大

// 上下占位高度
const topSpacerHeight = ref(0)
const bottomSpacerHeight = ref(0)

// 两列瀑布流（只对当前可见 items 划分）
const columns = reactive<[ImageItem[], ImageItem[]]>([[], []])
const columnHeights = reactive([0, 0])

// 滚动容器
const scrollContainerRef = ref<HTMLElement | null>(null)

function normalizeItems(items: ImageItemRaw[]): ImageItem[] {
  return items.map((img) => {
    const base = 200
    const jitter = Math.round(Math.random() * 300)
    const estimatedHeight = base + jitter
    return {
      ...img,
      status: 'loading',
      estimatedHeight,
    }
  })
}

// 追加新数据到 allItems，并更新 heightsPrefixSum/totalHeight
function appendItems(newItems: ImageItem[]) {
  newItems.forEach((item) => {
    const lastSum = heightsPrefixSum[heightsPrefixSum.length - 1] ?? 0
    heightsPrefixSum.push(lastSum + item.estimatedHeight)
    allItems.push(item)
  })
  totalHeight.value = heightsPrefixSum[heightsPrefixSum.length - 1] ?? 0
}

// 根据当前可见索引构建 columns + spacer
function rebuildVisible() {
  console.log('Rebuilding visible items,rebuildVisible 触发加载')
  const start = visibleStartIndex.value
  const end = visibleEndIndex.value
  const slice = allItems.slice(start, end)

  columns[0] = []
  columns[1] = []
  columnHeights[0] = 0
  columnHeights[1] = 0

  slice.forEach((item) => {
    const target = columnHeights[0] <= columnHeights[1] ? 0 : 1
    columns[target].push(item)
    columnHeights[target] += item.estimatedHeight
  })

  // 上方占位 = 前 start 个元素的高度和
  topSpacerHeight.value = heightsPrefixSum[start] ?? 0
  // 下方占位 = 总高度 - 前 end 个元素的高度和
  const endHeight = heightsPrefixSum[end] ?? totalHeight.value
  bottomSpacerHeight.value = Math.max(totalHeight.value - endHeight, 0)
}

// 简单线性查找：根据 scrollTop 找到大致的起始 index
function findStartIndexByScroll(scrollTop: number): number {
  // 这里数据不算极大，用线性足够；如果非常大可以改成二分
  const n = allItems.length
  for (let i = 0; i < n; i++) {
    const h = heightsPrefixSum[i]
    if (h >= scrollTop) return Math.max(0, i - 1)
  }
  return Math.max(0, n - 1)
}

function updateVisibleRange() {
  const container = scrollContainerRef.value
  if (!container || allItems.length === 0) return
  const scrollTop = container.scrollTop
  const viewHeight = container.clientHeight

  const approxStart = findStartIndexByScroll(scrollTop)
  let start = Math.max(approxStart - VISIBLE_BUFFER, 0)

  // 粗略目标高度范围 = scrollHeight ~ scrollTop + viewHeight
  const approxEndByHeight = (() => {
    const targetHeight = scrollTop + viewHeight
    const n = allItems.length
    for (let i = approxStart; i < n; i++) {
      if (heightsPrefixSum[i] >= targetHeight) return i + 1
    }
    return n
  })()

  // 找到渲染结尾的索引
  let end = Math.min(approxEndByHeight + VISIBLE_BUFFER, allItems.length)

  // 限制最大渲染条数
  if (end - start > MAX_VISIBLE_COUNT) {
    end = start + MAX_VISIBLE_COUNT
  }

  visibleStartIndex.value = start
  visibleEndIndex.value = end
  rebuildVisible()
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
    appendItems(normalized)
    updateVisibleRange()
    page.value += 1
    justLoaded.value = true // 标记刚刚加载过
  } catch (e) {
    console.error('加载图片失败', e)
  } finally {
    loading.value = false
  }
}

// 简单节流函数，避免滚动时高频重建虚拟列表导致闪烁
function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let last = 0
  let timer: number | null = null
  return function (this: any, ...args: any[]) {
    const now = Date.now()
    const remain = delay - (now - last)
    if (remain <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      last = now
      fn.apply(this, args)
    } else if (!timer) {
      timer = window.setTimeout(() => {
        last = Date.now()
        timer = null
        fn.apply(this, args)
      }, remain)
    }
  } as T
}

// 图片加载/失败状态
function handleImgLoad(item: ImageItem, e: Event) {
  item.status = 'loaded'
}

function handleImgError(item: ImageItem) {
  item.status = 'error'
}

const updateVisibleRangeThrottled = throttle(updateVisibleRange, 500)

function handleScroll() {
  const container = scrollContainerRef.value
  if (!container) return
  updateVisibleRangeThrottled()

  const scrollBottom = container.scrollTop + container.clientHeight
  const nearBottom = scrollBottom + 200 >= container.scrollHeight

  // 如果刚刚执行过一次 loadMore，则本次只重置 justLoaded，不再触发新加载
  if (justLoaded.value) {
    if (!nearBottom) {
      // 用户已经离开底部区域，才允许下一次靠近底部重新触发加载
      justLoaded.value = false
    }
    return
  }

  // 只有在非 justLoaded 状态下，且接近底部时，才真正加载更多
  if (nearBottom && !loading.value && !noMore.value) {
    loadMore()
  }
}

// 包一层节流版本，避免频繁重建虚拟列表导致闪烁
const handleScrollThrottled = throttle(handleScroll, 500)

onMounted(async () => {
  await loadMore() // 首次加载
  // 初始可见范围：从 0 开始
  visibleStartIndex.value = 0
  visibleEndIndex.value = Math.min(allItems.length, MAX_VISIBLE_COUNT)
  rebuildVisible()

  const container = scrollContainerRef.value
  if (container) {
    container.addEventListener('scroll', handleScrollThrottled, { passive: true })
  }
})

onUnmounted(() => {
  const container = scrollContainerRef.value
  if (container) {
    container.removeEventListener('scroll', handleScrollThrottled)
  }
})
</script>

<template>
  <!-- 这里作为独立滚动容器：高度由 layout 的 main 决定，一般是 flex-1 + overflow-y-auto -->
  <div ref="scrollContainerRef" class="w-full max-w-5xl mx-auto py-6 overflow-y-auto h-full">
    <div class="mb-4 text-lg font-semibold text-gray-700">图片展示</div>

    <!-- 顶部占位 -->
    <div :style="{ height: topSpacerHeight + 'px' }"></div>

    <!-- 当前可见区域的两列瀑布流 -->
    <div class="grid grid-cols-2 gap-3 md:gap-4">
      <div v-for="(col, colIndex) in columns" :key="colIndex" class="flex flex-col gap-3 md:gap-4">
        <div
          v-for="item in col"
          :key="item.serialNumber"
          class="bg-white rounded-lg shadow-sm overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <div class="w-full relative overflow-hidden">
            <div class="w-full relative" :style="{ height: item.estimatedHeight + 'px' }">
              <div
                v-if="item.status !== 'loaded'"
                class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center text-gray-400 text-xs"
              >
                {{ item.status === 'error' ? '加载失败' : '加载中...' }}
              </div>
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

    <!-- 底部占位 -->
    <div :style="{ height: bottomSpacerHeight + 'px' }"></div>

    <!-- 底部提示 -->
    <div class="mt-6 flex justify-center items-center text-sm text-gray-500">
      <span v-if="loading">加载中...</span>
      <span v-else-if="noMore">没有更多图片了</span>
      <span v-else>继续下拉加载更多</span>
    </div>
  </div>
</template>

<style scoped>
/* ...existing code... */
</style>
