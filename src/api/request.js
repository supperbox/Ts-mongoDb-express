import axios from 'axios'

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
    const token = localStorage.getItem('token')
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
    // 对响应数据做点什么
    const res = response
    // 如果自定义code不为0，则判断为错误
    if (res.status !== 0 && res.status !== 200) {
      console.warn('API error:', res.message || 'Error')
      // 根据不同错误码处理不同情况
      if (res.status === 401) {
        // 未授权，可能需要重新登录
        console.warn('Unauthorized, please login again')
        // 可以在这里添加重定向到登录页的逻辑
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  (error) => {
    // 对响应错误做点什么
    console.error('Response error:', error)
    return Promise.reject(error)
  },
)

export default service
