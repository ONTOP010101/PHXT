import request from './index'

export const getDisplaySettings = () => {
  return request({
    url: '/display/settings',
    method: 'get'
  })
}

export const saveDisplaySettings = (data) => {
  return request({
    url: '/display/settings',
    method: 'post',
    data
  })
}

export const getDisplayStatus = () => {
  return request({
    url: '/display/status',
    method: 'get'
  })
}

export const updateDisplayStatus = (data) => {
  return request({
    url: '/display/status',
    method: 'post',
    data
  })
}