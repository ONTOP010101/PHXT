import service from './index'

export const getRoleList = () => {
  return service.get('/role/list')
}

export const getRoleDetail = (roleId) => {
  return service.get(`/role/detail/${roleId}`)
}

export const addRole = (data) => {
  return service.post('/role/add', data)
}

export const updateRole = (data) => {
  return service.post('/role/update', data)
}

export const deleteRole = (roleId) => {
  return service.post(`/role/delete/${roleId}`)
}