import request from './index'

export const printTicket = (data) => {
  return request({
    url: '/print/ticket',
    method: 'post',
    data
  })
}

export const getPrinterList = () => {
  return request({
    url: '/print/printers',
    method: 'get'
  })
}
