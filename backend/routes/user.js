const express = require('express')
const router = express.Router()
const db = require('../models')
const bcrypt = require('bcryptjs')

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', role = '', status = '' } = req.query
    
    const where = {}
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { username: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { name: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    if (role && role !== '全部角色') {
      where.role = role
    }
    if (status && status !== '全部状态') {
      where.status = status === '启用' ? 1 : 0
    }
    
    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'name', 'role', 'status', 'createdAt', 'updatedAt'],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    })
    
    const userList = rows.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role === 'admin' ? '超级管理员' : user.role,
      status: user.status === 1 ? 'active' : 'disabled',
      lastLogin: user.updatedAt ? user.updatedAt.toLocaleString('zh-CN') : '-'
    }))
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        list: userList,
        total: count
      }
    })
  } catch (error) {
    console.error('Get user list error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/detail/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'username', 'name', 'role', 'status']
    })
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role === 'admin' ? '超级管理员' : user.role,
        status: user.status === 1 ? 'active' : 'disabled'
      }
    })
  } catch (error) {
    console.error('Get user detail error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/add', async (req, res) => {
  try {
    const { username, name, role = '管理员' } = req.body
    
    if (!username || !name) {
      return res.json({ code: 400, message: '请填写完整信息' })
    }
    
    const existingUser = await db.User.findOne({ where: { username } })
    if (existingUser) {
      return res.json({ code: 400, message: '用户名已存在' })
    }
    
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const user = await db.User.create({
      username,
      password: hashedPassword,
      name,
      role: role === '超级管理员' ? 'admin' : role,
      status: 1
    })
    
    res.json({
      code: 200,
      message: '添加成功',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role === 'admin' ? '超级管理员' : user.role,
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Add user error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/update', async (req, res) => {
  try {
    const { id, username, name, role, password, status } = req.body
    
    if (!id) {
      return res.json({ code: 400, message: '缺少用户ID' })
    }
    
    const user = await db.User.findByPk(id)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    if (username && username !== user.username) {
      const existingUser = await db.User.findOne({ where: { username, id: { [db.Sequelize.Op.ne]: id } } })
      if (existingUser) {
        return res.json({ code: 400, message: '用户名已存在' })
      }
    }
    
    const updateData = {
      username: username || user.username,
      name: name || user.name,
      role: role === '超级管理员' ? 'admin' : (role || user.role),
      status: status === 'active' ? 1 : (status === 'disabled' ? 0 : user.status)
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    await user.update(updateData)
    
    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role === 'admin' ? '超级管理员' : user.role,
        status: user.status === 1 ? 'active' : 'disabled'
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/delete/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await db.User.findByPk(userId)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    if (user.role === 'admin') {
      return res.json({ code: 400, message: '超级管理员不能删除' })
    }
    
    await user.destroy()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/reset-pwd/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    const user = await db.User.findByPk(userId)
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    const hashedPassword = await bcrypt.hash('123456', 10)
    await user.update({ password: hashedPassword })
    
    res.json({
      code: 200,
      message: '密码已重置为默认密码：123456'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router