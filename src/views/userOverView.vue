<script setup>
import { onMounted, ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'

const store = useUserInfoStore()
const loading = ref(false)

async function load() {
  loading.value = true
  setTimeout(() => {
    try {
      store.getAllUserInfo()
    } finally {
      loading.value = false
    }
  }, 1500) // 保证加载动画至少显示 500ms
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
</script>

<template>
  <div class="user-overview">
    <header class="header">
      <h2>用户概览</h2>
      <div class="actions">
        <button class="refresh ml-[20px]" @click="load" :disabled="loading">
          <span v-if="!loading">刷新</span>
          <span v-else class="spinner" aria-hidden="true"></span>
        </button>
      </div>
    </header>

    <main>
      <div v-if="loading" class="center info">
        <div class="spinner big" aria-hidden="true"></div>
        <div class="muted">加载中……</div>
      </div>

      <div v-else-if="!store.allUserInfo || store.allUserInfo.length === 0" class="center info">
        暂无用户数据
      </div>

      <ul v-else class="user-grid">
        <li v-for="(user, idx) in store.allUserInfo" :key="user._id || idx" class="card">
          <div class="card-left">
            <div class="avatar" :title="user.name || user.username">
              {{ getInitials(user) }}
            </div>
          </div>

          <div class="card-body">
            <div class="top-row">
              <div class="name">{{ user.name ?? user.username ?? '未命名用户' }}</div>
              <div class="meta">
                <!-- title 显示完整 id，文本使用 formatId 截断展示 -->
                <span class="id" :title="user._id ?? user.id ?? '-'">ID: {{ formatId(user) }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="field">
                <span class="label">年龄</span><span class="val">{{ user.age ?? '-' }}</span>
              </div>
              <div class="field">
                <span class="label">其他</span><span class="val">{{ user.role ?? '-' }}</span>
              </div>
            </div>

            <div class="interests">
              <div class="label">爱好</div>
              <div class="chips">
                <template v-if="normalizeInterests(user).length === 0">
                  <span class="chip empty">无</span>
                </template>
                <template v-else>
                  <template
                    v-for="(tag, i) in splitTags(normalizeInterests(user), 3).visible"
                    :key="i"
                  >
                    <span class="chip">{{ tag }}</span>
                  </template>
                  <span v-if="splitTags(normalizeInterests(user), 3).more > 0" class="chip more">
                    +{{ splitTags(normalizeInterests(user), 3).more }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<style lang="less" scoped>
.user-overview {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  color: #222;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .refresh {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid #e6e9ee;
      background: linear-gradient(180deg, #fff, #f7f9fb);
      cursor: pointer;
      font-weight: 500;
      color: #0f1724;
      transition:
        box-shadow 0.18s,
        transform 0.08s;
      &:hover {
        box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
        transform: translateY(-1px);
      }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }

    .spinner {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid rgba(0, 0, 0, 0.08);
      border-top-color: #2563eb;
      animation: spin 0.9s linear infinite;
      &.big {
        width: 40px;
        height: 40px;
        border-width: 4px;
      }
    }
  }

  main {
    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      gap: 8px;
    }
    .muted {
      color: #6b7280;
      font-size: 13px;
    }

    .user-grid {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }

    .card {
      display: flex;
      gap: 12px;
      padding: 14px;
      border-radius: 12px;
      background: linear-gradient(180deg, #ffffff, #fbfdff);
      border: 1px solid #eef2f7;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
      transition:
        transform 0.12s ease,
        box-shadow 0.12s ease;
      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      }

      .card-left {
        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          font-size: 18px;
          background: linear-gradient(135deg, #6d28d9, #2563eb);
          box-shadow: inset 0 -6px 12px rgba(255, 255, 255, 0.06);
        }
      }

      .card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .name {
            font-size: 16px;
            font-weight: 600;
            color: #0f1724;
          }
          .meta {
            display: flex;
            gap: 8px;
            align-items: center;
            font-size: 12px;
            color: #6b7280;
            .email {
              color: #374151;
            }
            /* 防止过长 id 损坏布局，单行省略并保持 tooltip 可见 */
            .id {
              color: #9ca3af;
              white-space: nowrap;
              max-width: 140px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: inline-block;
              vertical-align: middle;
            }
          }
        }

        .info-row {
          display: flex;
          gap: 18px;
          margin-top: 8px;
          .field {
            display: flex;
            gap: 8px;
            align-items: center;
            font-size: 13px;
            color: #4b5563;
            .label {
              color: #9ca3af;
              font-size: 12px;
            }
            .val {
              color: #111827;
              font-weight: 500;
            }
          }
        }

        .interests {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          .label {
            font-size: 12px;
            color: #6b7280;
            min-width: 42px;
            margin-top: 4px;
          }
          .chips {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
            .chip {
              display: inline-block;
              padding: 6px 8px;
              background: #f1f5f9;
              color: #0f1724;
              border-radius: 999px;
              font-size: 12px;
              border: 1px solid rgba(15, 23, 42, 0.04);
              box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
            }
            .chip.more {
              background: #eef2ff;
              color: #1e40af;
              border-color: #c7ddff;
              font-weight: 600;
            }
            .chip.empty {
              background: #fff7ed;
              color: #92400e;
              border-color: #ffe4c7;
            }
          }
        }
      }
    }
  }
}

/* spinner keyframes */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
