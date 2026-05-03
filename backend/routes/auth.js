const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../models')

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    const user = await db.User.findOne({ where: { username } })
    
    if (!user) {
      return res.json({ code: 401, message: '账号或密码错误' })
    }
    
    if (user.status !== 1) {
      return res.json({ code: 401, message: '账号已禁用' })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.json({ code: 401, message: '账号或密码错误' })
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )
    
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    await db.Token.destroy({ where: { userId: user.id } })
    
    await db.Token.create({
      userId: user.id,
      token,
      expiresAt
    })
    
    const roleName = user.role === 'admin' ? '超级管理员' : user.role
    const role = await db.Role.findOne({ where: { name: roleName } })
    
    let permissions = {}
    if (role) {
      permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions
    }
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
          permissions
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (token) {
    await db.Token.destroy({ where: { token } })
  }
  
  res.json({ code: 200, message: '退出成功' })
})

router.post('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.json({ code: 401, message: '未登录' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const dbToken = await db.Token.findOne({ where: { token } })
    if (!dbToken) {
      return res.json({ code: 401, message: '账号已在其他设备登录' })
    }
    
    if (new Date(dbToken.expiresAt) < new Date()) {
      await db.Token.destroy({ where: { token } })
      return res.json({ code: 401, message: 'token已过期' })
    }
    
    const user = await db.User.findByPk(decoded.id)
    if (!user) {
      return res.json({ code: 401, message: '用户不存在' })
    }
    
    const roleName = user.role === 'admin' ? '超级管理员' : user.role
    const role = await db.Role.findOne({ where: { name: roleName } })
    
    let permissions = {}
    if (role) {
      permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions
    }
    
    res.json({
      code: 200,
      message: '验证成功',
      data: {
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
          permissions
        }
      }
    })
  } catch (error) {
    await db.Token.destroy({ where: { token } })
    res.json({ code: 401, message: 'token已过期或无效' })
  }
})

module.exports = router