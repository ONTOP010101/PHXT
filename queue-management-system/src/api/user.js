import request from './index'

export const getUserList = (params) => {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

export const getUserDetail = (userId) => {
  return request({
    url: '/user/detail/' + userId,
    method: 'get'
  })
}

export const addUser = (data) => {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

export const updateUser = (data) => {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export const deleteUser = (userId) => {
  return request({
    url: '/user/delete/' + userId,
    method: 'post'
  })
}

export const resetPassword = (userId) => {
  return request({
    url: '/user/reset-pwd/' + userId,
    method: 'post'
  })
}