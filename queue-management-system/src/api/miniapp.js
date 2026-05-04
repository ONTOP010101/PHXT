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
