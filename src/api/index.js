import axios from 'axios'

const request = axios.create()

// request 拦截器
request.interceptors.request.use(
  config => {
    config.headers['content-type'] = config.contentType || 'application/json;charset=UTF-8'
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// response 拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

export default request