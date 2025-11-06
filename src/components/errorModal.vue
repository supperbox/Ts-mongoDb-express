<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 modal-content">
        <div class="flex items-start justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Error</h3>
          <button @click="handleClose" class="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div class="mt-4 text-sm text-gray-700">
          <div v-if="code" class="mb-2"><span class="font-medium">错误码：</span>{{ code }}</div>
          <div><span class="font-medium">错误信息：</span>{{ message }}</div>
        </div>
        <div class="mt-6 flex justify-end">
          <button
            @click="handleClose"
            class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  code: [String, Number],
  message: {
    type: String,
    default: '',
  },
  onClose: {
    type: Function,
    default: null,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  errorCode: {
    type: String,
    default: null,
  },
})

const loginStore = useLoginStore()
const router = useRouter()

function handleClose() {
  console.log('ErrorModal handleClose called with errorCode:', props.errorCode)
  if (props.errorCode === 'reload') {
    loginStore.logout()
    router.push('/login')
    return
  }
  if (props.onClose && typeof props.onClose === 'function') {
    try {
      props.onClose()
    } catch (e) {
      // ignore
    }
  }
}
</script>

<style scoped>
/* 主要使用 Tailwind，必要时可在此补充样式 */
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
