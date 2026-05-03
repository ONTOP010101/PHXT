import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 请求拦截器（添加token）
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器（统一处理错误）
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 假设后端约定：code=200为成功
    if (res.code !== 200) {
      console.error(res.msg || '请求失败')
      return Promise.reject(res)
    }
    return res
  },
  (error) => {
    console.error(error.message || '服务器错误')
    return Promise.reject(error)
  }
)

export default service