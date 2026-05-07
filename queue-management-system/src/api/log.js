import request from './index'

export const getLogList = (params) => {
  return request({
    url: '/log/list',
    method: 'get',
    params
  })
}

export const addLog = (data) => {
  return request({
    url: '/log/add',
    method: 'post',
    data
  })
}

export const deleteLog = (id) => {
  return request({
    url: '/log/delete/' + id,
    method: 'post'
  })
}

export const clearLogs = (data) => {
  return request({
    url: '/log/clear',
    method: 'post',
    data
  })
}
