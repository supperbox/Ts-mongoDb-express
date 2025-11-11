```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type Cell = { value: number | null; fixed: boolean }
type Pos = { r: number; c: number }

const SIZE = 9
const BOX = 3

const board = ref<Cell[][]>([])
const solution = ref<number[][]>([])
const conflicts = ref<Set<string>>(new Set())

const key = (r: number, c: number) => `${r}-${c}`

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ value: null, fixed: false })),
  )
}

function clone2D<T>(mat: T[][]): T[][] {
  return mat.map((row) => row.slice())
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function isSafe(grid: number[][], r: number, c: number, val: number): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (grid[r][i] === val || grid[i][c] === val) return false
  }
  const br = Math.floor(r / BOX) * BOX
  const bc = Math.floor(c / BOX) * BOX
  for (let i = 0; i < BOX; i++) {
    for (let j = 0; j < BOX; j++) {
      if (grid[br + i][bc + j] === val) return false
    }
  }
  return true
}

function findEmpty(grid: number[][]): Pos | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return { r, c }
    }
  }
  return null
}

function fillSolutionBacktrack(grid: number[][]): boolean {
  const spot = findEmpty(grid)
  if (!spot) return true
  const { r, c } = spot
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const n of nums) {
    if (isSafe(grid, r, c, n)) {
      grid[r][c] = n
      if (fillSolutionBacktrack(grid)) return true
      grid[r][c] = 0
    }
  }
  return false
}

function generateSolution(): number[][] {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  fillSolutionBacktrack(grid)
  return grid
}

function generatePuzzle(holeCount = 50) {
  // 基于完整解挖空
  const sol = generateSolution()
  solution.value = sol
  const puzzle = clone2D(sol)

  const positions: Pos[] = []
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) positions.push({ r, c })
  shuffle(positions)

  let removed = 0
  for (const { r, c } of positions) {
    if (removed >= holeCount) break
    puzzle[r][c] = 0
    removed++
  }

  // 映射到界面数据
  board.value = puzzle.map((row) =>
    row.map((v) => ({
      value: v === 0 ? null : v,
      fixed: v !== 0,
    })),
  )
  conflicts.value.clear()
}

function setCell(r: number, c: number, raw: string) {
  const cell = board.value[r][c]
  if (cell.fixed) return
  const n = parseInt(raw, 10)
  cell.value = Number.isFinite(n) && n >= 1 && n <= 9 ? n : null
  validateConflicts() // 实时检测冲突
}

function validateConflicts() {
  const set = new Set<string>()

  // 行、列检查
  for (let i = 0; i < SIZE; i++) {
    const rowSeen = new Map<number, number[]>()
    const colSeen = new Map<number, number[]>()
    for (let j = 0; j < SIZE; j++) {
      const rv = board.value[i][j].value
      const cv = board.value[j][i].value
      if (rv) {
        const list = rowSeen.get(rv) ?? []
        list.push(j)
        rowSeen.set(rv, list)
      }
      if (cv) {
        const list = colSeen.get(cv) ?? []
        list.push(j)
        colSeen.set(cv, list)
      }
    }
    for (const [, idxs] of rowSeen) if (idxs.length > 1) idxs.forEach((c) => set.add(key(i, c)))
    for (const [, idxs] of colSeen) if (idxs.length > 1) idxs.forEach((r) => set.add(key(r, i)))
  }

  // 宫检查
  for (let br = 0; br < SIZE; br += BOX) {
    for (let bc = 0; bc < SIZE; bc += BOX) {
      const seen = new Map<number, Pos[]>()
      for (let r = 0; r < BOX; r++) {
        for (let c = 0; c < BOX; c++) {
          const R = br + r
          const C = bc + c
          const v = board.value[R][C].value
          if (!v) continue
          const list = seen.get(v) ?? []
          list.push({ r: R, c: C })
          seen.set(v, list)
        }
      }
      for (const [, poses] of seen) {
        if (poses.length > 1) poses.forEach((p) => set.add(key(p.r, p.c)))
      }
    }
  }

  conflicts.value = set
}

function clearBoard() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board.value[r][c].fixed) board.value[r][c].value = null
    }
  }
  conflicts.value.clear()
}

const isComplete = computed(
  () =>
    board.value.length === SIZE && board.value.every((row) => row.every((cell) => !!cell.value)),
)

function newGame() {
  generatePuzzle(52)
}

// 初始化时检测一次冲突
newGame()
validateConflicts()
</script>

<template>
  <section class="mx-auto max-w-4xl py-10">
    <div class="flex justify-center">
      <div class="p-4">
        <div class="grid grid-cols-9 gap-1 bg-gray-400 p-1 rounded-lg select-none">
          <template v-for="(row, r) in board" :key="r">
            <div
              v-for="(cell, c) in row"
              :key="c"
              class="relative"
              :class="[
                'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center',
                r % 3 === 0 ? 'border-t-4 border-t-gray-800' : '',
                c % 3 === 0 ? 'border-l-4 border-l-gray-800' : '',
                r === 8 ? 'border-b-4 border-b-gray-800' : '',
                c === 8 ? 'border-r-4 border-r-gray-800' : '',
                cell.fixed ? 'bg-gray-200' : 'bg-white',
                conflicts.has(`${r}-${c}`) ? 'bg-red-100 border-2 border-red-500' : '',
              ]"
            >
              <input
                :value="cell.value ?? ''"
                :readonly="cell.fixed"
                maxlength="1"
                inputmode="numeric"
                pattern="[1-9]"
                @input="setCell(r, c, ($event.target as HTMLInputElement).value)"
                :class="[
                  'w-full h-full text-center outline-none bg-transparent text-2xl sm:text-3xl md:text-4xl font-bold',
                  conflicts.has(`${r}-${c}`)
                    ? 'text-red-600'
                    : cell.fixed
                      ? 'text-gray-800'
                      : 'text-blue-700',
                ]"
              />
            </div>
          </template>
        </div>

        <div class="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            class="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg font-semibold shadow"
            @click="newGame"
          >
            新局
          </button>
          <button
            class="px-5 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 text-lg font-semibold shadow"
            @click="clearBoard"
          >
            清空填写
          </button>
        </div>

        <div class="mt-4 text-center text-sm text-gray-600">
          {{
            isComplete
              ? '✅ 已填写完毕（请确保无冲突）'
              : '💡 请输入 1-9，灰色为题面不可编辑，红色表示冲突'
          }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ...existing code... */
</style>
```
