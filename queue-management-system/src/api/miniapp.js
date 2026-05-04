import request from './index'

export const getBanner = () => {
  return request({
    url: '/miniapp/banner',
    method: 'get'
  })
}

export const saveBanner = (data) => {
  return request({
    url: '/miniapp/banner',
    method: 'post',
    data
  })
}

export const getNoticeList = () => {
  return request({
    url: '/miniapp/notices',
    method: 'get'
  })
}

export const getNoticeDetail = (id) => {
  return request({
    url: `/miniapp/notices/${id}`,
    method: 'get'
  })
}

export const addNotice = (data) => {
  return request({
    url: '/miniapp/notices',
    method: 'post',
    data
  })
}

export const updateNotice = (id, data) => {
  return request({
    url: `/miniapp/notices/${id}`,
    method: 'post',
    data
  })
}

export const deleteNotice = (id) => {
  return request({
    url: `/miniapp/notices/delete/${id}`,
    method: 'post'
  })
}

export const getMiniAppHomeData = () => {
  return request({
    url: '/miniapp/getNotices',
    method: 'get'
  })
}

export const getMiniAppUsers = (params) => {
  return request({
    url: '/miniapp/users',
    method: 'get',
    params
  })
}

export const getMiniAppUserDetail = (id) => {
  return request({
    url: `/miniapp/users/${id}`,
    method: 'get'
  })
}

export const updateMiniAppUser = (data) => {
  return request({
    url: '/miniapp/users/update',
    method: 'post',
    data
  })
}

export const deleteMiniAppUser = (id) => {
  return request({
    url: `/miniapp/users/delete/${id}`,
    method: 'post'
  })
}
