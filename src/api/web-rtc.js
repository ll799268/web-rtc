import request from './index'

/**
 * 开始录制
 * @param {*} data 
 * @returns 
 */
export const recordStart = data => {
  return request({
    url: `video/recordStart`,
    method: 'post',
    data
  })
}

/**
 * 停止录制
 * @param {*} threadId 
 * @returns 
 */
export const recordStop = threadId => {
  return request({
    url: `video/recordStop?threadId=${ threadId }`,
  })
}

/**
 * 录制列表
 * @returns 
 */
export const getVideoList = () => {
  return request({
    url: `video/list`,
  })
}
