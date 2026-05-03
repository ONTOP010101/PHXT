import request from './index'

export const getMeetingList = (params) => {
  return request({
    url: '/meeting/list',
    method: 'get',
    params
  })
}

export const getMeetingDetail = (id) => {
  return request({
    url: `/meeting/detail/${id}`,
    method: 'get'
  })
}

export const addMeeting = (data) => {
  return request({
    url: '/meeting/add',
    method: 'post',
    data
  })
}

export const updateMeeting = (data) => {
  return request({
    url: '/meeting/update',
    method: 'post',
    data
  })
}

export const enableMeeting = (id) => {
  return request({
    url: '/meeting/enable',
    method: 'post',
    data: { id }
  })
}

export const pauseMeeting = (id) => {
  return request({
    url: '/meeting/pause',
    method: 'post',
    data: { id }
  })
}

export const closeMeeting = (id) => {
  return request({
    url: '/meeting/close',
    method: 'post',
    data: { id }
  })
}

export const deleteMeeting = (id) => {
  return request({
    url: `/meeting/delete/${id}`,
    method: 'post'
  })
}