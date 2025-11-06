import axios from 'axios'
import { showError } from '@/utils/errorHandler'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'api', // 基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如：获取并设置token
    const store = useLoginStore()
    const token = store.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // HTTP 状态判断：非 200 视为错误，显示错误弹窗
    const status = response?.status
    const message = response?.data?.message ?? response?.statusText ?? '未知错误'
    if (status !== 200) {
      try {
        showError(status, message)
      } catch (e) {
        console.error('showError 调用失败', e)
      }
      return Promise.reject(new Error(message))
    }
    // 返回实际 data，方便调用端使用
    return response.data ?? response
  },
  (error) => {
    // 网络或其他错误
    const code = error?.response?.status ?? 'NETWORK_ERROR'
    const msg = error?.response?.data?.message ?? error.message ?? '网络或服务器错误'
    const errCode = error?.response?.data?.code
    try {
      showError(code, msg, errCode)
    } catch (e) {
      console.error('showError 调用失败', e)
    }
    return Promise.reject(error)
  },
)

export default service
