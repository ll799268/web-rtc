import request from './index'

export const recordStart = data => {
  return request({
    url: `/video/recordStart`,
    method: 'post',
    data
  })
}

export const recordStop = threadId => {
  return request({
    url: `/video/recordStop?threadId=${ threadId }`,
  })
}
