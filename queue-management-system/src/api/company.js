import request from './index'

export const getCompanyList = (params) => {
  return request({
    url: '/company/list',
    method: 'get',
    params
  })
}

export const getCompanyDetail = (companyId) => {
  return request({
    url: `/company/detail/${companyId}`,
    method: 'get'
  })
}

export const addCompany = (data) => {
  return request({
    url: '/company/add',
    method: 'post',
    data
  })
}

export const updateCompany = (data) => {
  return request({
    url: '/company/update',
    method: 'post',
    data
  })
}

export const batchAddCompany = (data) => {
  return request({
    url: '/company/batch-add',
    method: 'post',
    data
  })
}

export const deleteCompany = (companyId) => {
  return request({
    url: `/company/delete/${companyId}`,
    method: 'post'
  })
}