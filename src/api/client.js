import axios from 'axios'

// 开发环境通过 vite.config.js 的 proxy 转发到 http://127.0.0.1:9090/tdprest-2
const baseURL = import.meta.env.VITE_API_BASE_URL || '/tdprest-2/api/air'

export const http = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    // 接口默认返回 XML，必须显式声明 JSON
    Accept: 'application/json',
  },
})

export class ApiError extends Error {
  constructor(message, { code, status, payload } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code || ''
    this.status = status || 0
    this.payload = payload || null
  }
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data
    const detail = payload?.error?.[0]
    let fallback = error.message || '网络请求失败'
    if (error?.code === 'ECONNABORTED' || /timeout/i.test(fallback)) {
      fallback = '查询超时，请稍后重试'
    } else if (!error?.response) {
      fallback = '网络连接失败，请确认查询服务已启动'
    }
    const message = detail?.description || detail?.code || fallback
    return Promise.reject(
      new ApiError(message, {
        code: detail?.code,
        status: error?.response?.status,
        payload,
      }),
    )
  },
)
