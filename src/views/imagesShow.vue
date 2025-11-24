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
  imageHeight?: number
}
type ImageStatus = 'loading' | 'loaded' | 'error'
interface ImageItem extends ImageItemRaw {
  status: ImageStatus
  imageHeight: number
  column: 0 | 1
}

// 分页 / 加载
const page = ref(1)
const pageSize = ref(30)
const loading = ref(false)
const noMore = ref(false)

const justLoaded = ref(false) // 标记刚刚加载过一次

// 所有图片数据（扁平）
const allItems = reactive<ImageItem[]>([])
const layoutHistory = reactive<[number, number][]>([])
const visibleColumns = reactive<[ImageItem[], ImageItem[]]>([[], []])
const columnHeights = reactive([0, 0])
const topSpacers = reactive([0, 0])
const bottomSpacers = reactive([0, 0])

// 虚拟窗口：只渲染 [visibleStartIndex, visibleEndIndex)
const visibleStartIndex = ref(0)
const visibleEndIndex = ref(0)
const VISIBLE_BUFFER = 10 // 上下各多渲染一些，避免频繁抖动
const MAX_VISIBLE_COUNT = 60 // 最大渲染条目数，防止 DOM 过大

// 滚动容器
const scrollContainerRef = ref<HTMLElement | null>(null)

function normalizeItems(items: ImageItemRaw[]): ImageItem[] {
  return items.map((img) => ({
    ...img,
    status: 'loading',
    imageHeight: img.imageHeight && img.imageHeight > 0 ? img.imageHeight : 300,
    column: 0,
  }))
}

function appendItems(newItems: ImageItem[]) {
  newItems.forEach((item) => {
    const target = columnHeights[0] <= columnHeights[1] ? 0 : 1
    item.column = target
    columnHeights[target] += item.imageHeight + 20 // 包括 gap
    // 记录每张图片加载后两列的高度
    layoutHistory.push([columnHeights[0], columnHeights[1]])
    allItems.push(item)
  })
}

function rebuildVisible() {
  const start = visibleStartIndex.value
  const end = visibleEndIndex.value
  visibleColumns[0] = []
  visibleColumns[1] = []
  allItems.slice(start, end).forEach((item) => {
    visibleColumns[item.column].push(item)
  })
  if (start > 0) {
    const prev = layoutHistory[start - 1]
    topSpacers[0] = prev[0]
    topSpacers[1] = prev[1]
  } else {
    topSpacers[0] = 0
    topSpacers[1] = 0
  }
  const endSnapshot = end > 0 ? layoutHistory[end - 1] : [0, 0]
  bottomSpacers[0] = Math.max(columnHeights[0] - endSnapshot[0], 0)
  bottomSpacers[1] = Math.max(columnHeights[1] - endSnapshot[1], 0)
}

function findStartIndexByScroll(scrollTop: number): number {
  let low = 0
  let high = layoutHistory.length - 1
  let res = 0
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const minH = Math.min(layoutHistory[mid][0], layoutHistory[mid][1])
    if (minH < scrollTop) {
      res = mid + 1
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return Math.min(res, Math.max(allItems.length - 1, 0))
}

function findIndexByHeight(targetHeight: number): number {
  let low = 0
  let high = layoutHistory.length - 1
  let res = layoutHistory.length
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const minH = Math.min(layoutHistory[mid][0], layoutHistory[mid][1])
    if (minH < targetHeight) {
      low = mid + 1
    } else {
      res = mid
      high = mid - 1
    }
  }
  return res
}

function updateVisibleRange() {
  const container = scrollContainerRef.value
  if (!container || allItems.length === 0) return
  const scrollTop = container.scrollTop
  const viewHeight = container.clientHeight

  const approxStart = findStartIndexByScroll(scrollTop)
  let start = Math.max(approxStart - VISIBLE_BUFFER, 0)
  let end = findIndexByHeight(scrollTop + viewHeight) + VISIBLE_BUFFER
  if (end > allItems.length) end = allItems.length
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
    // 加载新一批的图片
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

const updateVisibleRangeThrottled = throttle(updateVisibleRange, 200)

function handleScroll() {
  const container = scrollContainerRef.value
  if (!container) return
  updateVisibleRangeThrottled()

  const scrollBottom = container.scrollTop + container.clientHeight
  const nearBottom = scrollBottom + 300 >= container.scrollHeight

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
const handleScrollThrottled = throttle(handleScroll, 300)

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

    <div class="grid grid-cols-2 gap-[20px]">
      <div v-for="colIndex in [0, 1]" :key="colIndex" class="flex flex-col gap-[20px]">
        <!-- 顶部占位 -->
        <div :style="{ height: topSpacers[colIndex] + 'px' }"></div>

        <!-- 当前可见区域的两列瀑布流 -->
        <div
          v-for="item in visibleColumns[colIndex]"
          :key="item.serialNumber"
          class="bg-white rounded-lg shadow-sm overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <div class="w-full relative overflow-hidden">
            <div class="w-full relative flex flex-col" :style="{ height: item.imageHeight + 'px' }">
              <div
                v-if="item.status !== 'loaded'"
                class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center text-gray-400 text-xs"
              >
                {{ item.status === 'error' ? '加载失败' : '加载中...' }}
              </div>
              <img
                :src="`http://localhost:3001/uploads/${item.name}`"
                :alt="item.name"
                class="w-full transition-opacity duration-500 object-cover"
                :class="item.status === 'loaded' ? 'opacity-100' : 'opacity-0'"
                loading="lazy"
                :style="{ height: item.imageHeight - 30 + 'px' }"
                @load="handleImgLoad(item, $event)"
                @error="handleImgError(item)"
              />
              <div
                class="px-3 py-2 text-xs text-gray-500 flex justify-between items-center h-[30px]"
              >
                <span class="truncate max-w-[70%]" :title="item.name">{{ item.name }}</span>
                <span>{{ (item.size / 1024).toFixed(1) }} KB</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部占位 -->
        <div :style="{ height: bottomSpacers[colIndex] + 'px' }"></div>
      </div>
    </div>

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
