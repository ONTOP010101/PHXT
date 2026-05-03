import request from './index'

export const getCustomerList = (params) => {
  return request({
    url: '/customer/list',
    method: 'get',
    params
  })
}

export const getCustomerDetail = (customerId) => {
  return request({
    url: `/customer/detail/${customerId}`,
    method: 'get'
  })
}

export const addCustomer = (data) => {
  return request({
    url: '/customer/add',
    method: 'post',
    data
  })
}

export const updateCustomer = (data) => {
  return request({
    url: '/customer/update',
    method: 'post',
    data
  })
}

export const deleteCustomer = (customerId) => {
  return request({
    url: `/customer/delete/${customerId}`,
    method: 'post'
  })
}