const express = require('express')
const router = express.Router()
const db = require('../models')
const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {
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
    const user = await db.User.findByPk(decoded.id)
    if (!user) {
      return res.json({ code: 401, message: '用户不存在' })
    }
    req.user = user
    next()
  } catch (error) {
    return res.json({ code: 401, message: 'token已过期或无效' })
  }
}

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, module = '', action = '', operator = '', detail = '', startDate = '', endDate = '' } = req.query

    const where = {}
    if (module) {
      where.module = module
    }
    if (action) {
      where.action = { [db.Sequelize.Op.like]: `%${action}%` }
    }
    if (operator) {
      where[db.Sequelize.Op.or] = [
        { operator: { [db.Sequelize.Op.like]: `%${operator}%` } },
        { operatorName: { [db.Sequelize.Op.like]: `%${operator}%` } }
      ]
    }
    if (detail) {
      where.detail = { [db.Sequelize.Op.like]: `%${detail}%` }
    }
    if (startDate && endDate) {
      where.createdAt = {
        [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')]
      }
    } else if (startDate) {
      where.createdAt = {
        [db.Sequelize.Op.gte]: new Date(startDate)
      }
    } else if (endDate) {
      where.createdAt = {
        [db.Sequelize.Op.lte]: new Date(endDate + ' 23:59:59')
      }
    }

    const { count, rows } = await db.SystemLog.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    })

    const logList = rows.map(log => ({
      id: log.id,
      module: log.module,
      action: log.action,
      operator: log.operator,
      operatorName: log.operatorName,
      targetId: log.targetId,
      detail: log.detail,
      ip: log.ip,
      status: log.status,
      createdAt: log.createdAt ? log.createdAt.toLocaleString('zh-CN') : '-'
    }))

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: logList,
        total: count
      }
    })
  } catch (error) {
    console.error('Get system log list error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

const parseIp = (ip) => {
  if (!ip) return ''
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7)
  }
  if (ip === '::1') {
    return '127.0.0.1'
  }
  return ip
}

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { module, action, targetId, detail, status = 1 } = req.body
    const user = req.user
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    ip = parseIp(ip)

    const log = await db.SystemLog.create({
      module,
      action,
      operator: user.username,
      operatorName: user.name,
      targetId: targetId || null,
      detail: detail || null,
      ip,
      status
    })

    res.json({
      code: 200,
      message: '日志记录成功',
      data: { id: log.id }
    })
  } catch (error) {
    console.error('Add system log error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const log = await db.SystemLog.findByPk(id)
    if (!log) {
      return res.json({ code: 404, message: '日志不存在' })
    }
    await log.destroy()
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('Delete system log error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/clear', authMiddleware, async (req, res) => {
  try {
    const { module = '', beforeDate = '' } = req.body
    const where = {}
    if (module) {
      where.module = module
    }
    if (beforeDate) {
      where.createdAt = {
        [db.Sequelize.Op.lte]: new Date(beforeDate + ' 23:59:59')
      }
    }
    const count = await db.SystemLog.destroy({ where })
    res.json({ code: 200, message: `已清除 ${count} 条日志` })
  } catch (error) {
    console.error('Clear system logs error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router
