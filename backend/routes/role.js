const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/list', async (req, res) => {
  try {
    const roles = await db.Role.findAll({
      attributes: ['id', 'name', 'description', 'permissions', 'status', 'createdAt', 'updatedAt'],
      order: [['id', 'ASC']]
    })

    const roleList = roles.map(role => {
      let permissions = role.permissions
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions)
        } catch (e) {
          permissions = {}
        }
      }
      return {
        id: role.id,
        name: role.name,
        description: role.description || '',
        permissions,
        status: role.status === 1 ? 'enabled' : 'disabled',
        createdAt: role.createdAt ? role.createdAt.toLocaleString('zh-CN') : '-',
        updatedAt: role.updatedAt ? role.updatedAt.toLocaleString('zh-CN') : '-'
      }
    })

    res.json({
      code: 200,
      message: 'success',
      data: roleList
    })
  } catch (error) {
    console.error('Get role list error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/detail/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params

    const role = await db.Role.findByPk(roleId, {
      attributes: ['id', 'name', 'description', 'permissions', 'status']
    })

    if (!role) {
      return res.json({ code: 404, message: '角色不存在' })
    }

    let permissions = role.permissions
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions)
      } catch (e) {
        permissions = {}
      }
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        id: role.id,
        name: role.name,
        description: role.description || '',
        permissions,
        status: role.status === 1 ? 'enabled' : 'disabled'
      }
    })
  } catch (error) {
    console.error('Get role detail error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/add', async (req, res) => {
  try {
    const { name, description, permissions } = req.body

    if (!name || !permissions) {
      return res.json({ code: 400, message: '请填写完整信息' })
    }

    const existingRole = await db.Role.findOne({ where: { name } })
    if (existingRole) {
      return res.json({ code: 400, message: '角色名称已存在' })
    }

    const role = await db.Role.create({
      name,
      description: description || '',
      permissions: typeof permissions === 'string' ? JSON.parse(permissions) : permissions,
      status: 1
    })

    let finalPermissions = role.permissions
    if (typeof finalPermissions === 'string') {
      try {
        finalPermissions = JSON.parse(finalPermissions)
      } catch (e) {
        finalPermissions = {}
      }
    }

    res.json({
      code: 200,
      message: '添加成功',
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: finalPermissions,
        status: 'enabled'
      }
    })
  } catch (error) {
    console.error('Add role error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/update', async (req, res) => {
  try {
    const { id, name, description, permissions } = req.body

    if (!id) {
      return res.json({ code: 400, message: '缺少角色ID' })
    }

    const role = await db.Role.findByPk(id)

    if (!role) {
      return res.json({ code: 404, message: '角色不存在' })
    }

    if (name && name !== role.name) {
      const existingRole = await db.Role.findOne({ where: { name, id: { [db.Sequelize.Op.ne]: id } } })
      if (existingRole) {
        return res.json({ code: 400, message: '角色名称已存在' })
      }
    }

    const updateData = {
      name: name || role.name,
      description: description !== undefined ? description : role.description
    }

    if (permissions) {
      updateData.permissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions
    }

    await role.update(updateData)

    let finalPermissions = role.permissions
    if (typeof finalPermissions === 'string') {
      try {
        finalPermissions = JSON.parse(finalPermissions)
      } catch (e) {
        finalPermissions = {}
      }
    }

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: finalPermissions,
        status: role.status === 1 ? 'enabled' : 'disabled'
      }
    })
  } catch (error) {
    console.error('Update role error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/delete/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params

    const role = await db.Role.findByPk(roleId)

    if (!role) {
      return res.json({ code: 404, message: '角色不存在' })
    }

    const superAdminRole = await db.Role.findOne({ where: { name: '超级管理员' } })
    if (superAdminRole && role.id === superAdminRole.id) {
      return res.json({ code: 400, message: '超级管理员角色不能删除' })
    }

    const usersWithRole = await db.User.count({ where: { role: role.name } })
    if (usersWithRole > 0) {
      return res.json({ code: 400, message: '该角色下存在用户，无法删除' })
    }

    await role.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete role error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router