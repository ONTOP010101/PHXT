import request from './index'

// 获取今日排号统计
export const getTodayQueueStats = () => {
  return request({
    url: '/queue/stats/today',
    method: 'get'
  })
}

// 获取排号列表
export const getQueueList = (params) => {
  return request({
    url: '/queue/list',
    method: 'get',
    params
  })
}

// 叫号操作
export const callNextQueue = (queueId) => {
  return request({
    url: '/queue/call/' + queueId,
    method: 'post'
  })
}

export const batchCallQueue = (roomId, count = 10) => {
  return request({
    url: '/queue/batch-call/' + roomId,
    method: 'post',
    data: { count }
  })
}

// 新增排号
export const addQueue = (data) => {
  return request({
    url: '/queue/add',
    method: 'post',
    data
  })
}

// 取消排号
export const cancelQueue = (queueId) => {
  return request({
    url: '/queue/cancel/' + queueId,
    method: 'post'
  })
}

// 重排
export const requeue = (queueId) => {
  return request({
    url: '/queue/requeue/' + queueId,
    method: 'post'
  })
}

// 标记排号完成
export const completeQueue = (queueId) => {
  return request({
    url: '/queue/complete/' + queueId,
    method: 'post'
  })
}

// 更新排号
export const updateQueue = (data) => {
  return request({
    url: '/queue/update',
    method: 'post',
    data
  })
}