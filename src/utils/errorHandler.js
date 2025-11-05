import { createApp, ref, h } from 'vue'
import ErrorModal from '@/components/errorModal.vue'

// 包裹组件，控制显示和卸载
const ErrorModalWrapper = {
  props: ['code', 'message', 'onClose'],
  setup(props) {
    const visible = ref(true)
    function handleClose() {
      visible.value = false
    }
    function afterLeave() {
      if (props.onClose) props.onClose()
    }
    return () =>
      h(ErrorModal, {
        code: props.code,
        message: props.message,
        onClose: handleClose,
        visible: visible.value,
        // 监听过渡结束
        onVnodeUnmounted: afterLeave,
      })
  },
}

export function showError(code, message) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const cleanup = () => {
    try {
      app.unmount()
    } catch (e) {
      /* ignore */
    }
    if (container.parentNode) container.parentNode.removeChild(container)
  }

  const app = createApp(ErrorModalWrapper, {
    code,
    message,
    onClose: cleanup,
  })
  app.mount(container)
}
