const express = require('express')
const router = express.Router()
const db = require('../models')

const { broadcastRoomUpdate, broadcast, getRoomsData } = require('../websocket')

const broadcastAllRooms = async () => {
  try {
    const rooms = await getRoomsData()
    broadcastRoomUpdate(rooms)
  } catch (error) {
    console.error('Broadcast rooms error:', error)
  }
}

// 生成下一个可用排号（在事务内执行，避免竞态条件）
const generateNextQueueNumber = async (roomId, transaction) => {
  const todayStart = new Date(new Date().toDateString())

  // 使用事务查询今天该洽谈室所有非取消状态的排号
  const todayQueues = await db.Queue.findAll({
    where: {
      roomId,
      status: { [db.Sequelize.Op.ne]: 'cancelled' },
      createdAt: { [db.Sequelize.Op.gte]: todayStart }
    },
    transaction,
    lock: transaction ? db.Sequelize.Transaction.LOCK.UPDATE : undefined
  })

  // 找到最大的已使用号码（只考虑不带-后缀的主号）
  const existingNumbers = todayQueues
    .filter(q => q.queueNumber && !q.queueNumber.includes('-'))
    .map(q => parseInt(q.queueNumber.split('_')[1]))

  let nextNum = 1
  if (existingNumbers.length > 0) {
    nextNum = Math.max(...existingNumbers) + 1
  }

  // 确保号码不重复（考虑所有类型的排号）
  const allQueueNumbers = new Set(todayQueues.map(q => q.queueNumber).filter(Boolean))
  let candidateNumber = `${roomId}_${String(nextNum).padStart(3, '0')}`
  while (allQueueNumbers.has(candidateNumber)) {
    nextNum++
    candidateNumber = `${roomId}_${String(nextNum).padStart(3, '0')}`
  }

  return candidateNumber
}

// 生成重排号（过号重排，排在当前叫号后3位）
const generateRequeueNumber = async (queue, transaction) => {
  const todayStart = new Date(new Date().toDateString())

  const allQueues = await db.Queue.findAll({
    where: {
      roomId: queue.roomId,
      status: { [db.Sequelize.Op.ne]: 'cancelled' },
      createdAt: { [db.Sequelize.Op.gte]: todayStart }
    },
    transaction,
    lock: transaction ? db.Sequelize.Transaction.LOCK.UPDATE : undefined
  })

  // 如果没有queueNumber（专点未排号情况），直接分配新主号
  if (!queue.queueNumber) {
    return generateNextQueueNumber(queue.roomId, transaction)
  }

  // 获取当前已叫号的最大基础号
  const calledQueues = allQueues.filter(q => q.status === 'called')
  let currentCallNum = 0
  calledQueues.forEach(q => {
    if (q.queueNumber) {
      const basePart = q.queueNumber.split('-')[0]
      const num = parseInt(basePart.split('_')[1])
      if (num > currentCallNum) currentCallNum = num
    }
  })

  // 获取所有已使用的基础号
  const allBaseNums = allQueues
    .filter(q => q.queueNumber)
    .map(q => parseInt(q.queueNumber.split('-')[0].split('_')[1]))
    .sort((a, b) => a - b)

  const maxBaseNum = allBaseNums.length > 0 ? allBaseNums[allBaseNums.length - 1] : 0

  // 计算当前叫号后还有多少个等待中的排号
  const waitingQueues = allQueues.filter(q => q.status === 'waiting' && q.queueNumber)
  const countAfterCurrent = waitingQueues.filter(q => {
    const basePart = q.queueNumber.split('-')[0]
    const num = parseInt(basePart.split('_')[1])
    return num > currentCallNum
  }).length

  const allQueueNumbers = new Set(allQueues.map(q => q.queueNumber).filter(Boolean))

  // 如果当前叫号后已有3个或更多等待排号，则插入到后面使用 -1/-2/-3 后缀
  if (countAfterCurrent >= 3) {
    let baseNumber = currentCallNum + 3
    // 确保baseNumber不超过当前最大基础号
    if (baseNumber > maxBaseNum) {
      baseNumber = maxBaseNum
    }
    // 从baseNumber开始往后找，找到第一个有空余后缀的位置
    while (baseNumber <= maxBaseNum + 1) {
      for (let suffix = 1; suffix <= 3; suffix++) {
        const candidate = `${queue.roomId}_${String(baseNumber).padStart(3, '0')}-${suffix}`
        if (!allQueueNumbers.has(candidate)) {
          return candidate
        }
      }
      baseNumber++
    }
    // 如果所有后缀都被占用了，fallback到生成新主号
    return generateNextQueueNumber(queue.roomId, transaction)
  } else {
    // 当前叫号后不足3个，直接生成新的主号排在队尾
    let newQueueNumber = `${queue.roomId}_${String(maxBaseNum + 1).padStart(3, '0')}`
    while (allQueueNumbers.has(newQueueNumber)) {
      const num = parseInt(newQueueNumber.split('_')[1]) + 1
      newQueueNumber = `${queue.roomId}_${String(num).padStart(3, '0')}`
    }
    return newQueueNumber
  }
}

router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const total = await db.Queue.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: today,
          [db.Sequelize.Op.lt]: tomorrow
        }
      }
    })

    const done = await db.Queue.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: today,
          [db.Sequelize.Op.lt]: tomorrow
        },
        completed: true
      }
    })

    const waiting = await db.Queue.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: today,
          [db.Sequelize.Op.lt]: tomorrow
        },
        status: 'waiting',
        completed: false
      }
    })

    res.json({
      code: 200,
      message: 'success',
      data: {
        total,
        done,
        waiting
      }
    })
  } catch (error) {
    console.error('Get queue stats error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, roomId = '', status = '' } = req.query

    const where = {}
    if (roomId) {
      where.roomId = roomId
    }
    if (status) {
      where.status = status
    }

    const { count, rows } = await db.Queue.findAndCountAll({
      where,
      include: [
        { model: db.Customer, as: 'customer' },
        { model: db.Company, as: 'company' },
        { model: db.MeetingRoom, as: 'meetingRoom' }
      ],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    })

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count
      }
    })
  } catch (error) {
    console.error('Get queue list error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/add', async (req, res) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { customerId, companyId, roomId } = req.body

    if (!roomId || (!customerId && !companyId)) {
      await transaction.rollback()
      return res.json({ code: 400, message: '请填写完整信息' })
    }

    const room = await db.MeetingRoom.findByPk(roomId, { transaction })
    if (!room) {
      await transaction.rollback()
      return res.json({ code: 404, message: '洽谈室不存在' })
    }

    if (customerId) {
      const customer = await db.Customer.findByPk(customerId, { transaction })
      if (!customer) {
        await transaction.rollback()
        return res.json({ code: 404, message: '客户不存在' })
      }

      const existingCustomerQueue = await db.Queue.findOne({
        where: {
          customerId,
          roomId,
          completed: false,
          status: { [db.Sequelize.Op.ne]: 'cancelled' }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      })

      if (existingCustomerQueue) {
        await transaction.rollback()
        return res.json({ code: 400, message: '该洽谈室已存在该客户的排号记录' })
      }
    }

    if (companyId) {
      const company = await db.Company.findByPk(companyId, { transaction })
      if (!company) {
        await transaction.rollback()
        return res.json({ code: 404, message: '厂商不存在' })
      }

      const existingQueue = await db.Queue.findOne({
        where: {
          companyId,
          roomId,
          completed: false,
          status: { [db.Sequelize.Op.ne]: 'cancelled' }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      })

      if (existingQueue) {
        if (existingQueue.queueNumber) {
          await transaction.rollback()
          return res.json({ code: 400, message: '该洽谈室已存在该厂商的排号记录' })
        }

        const candidateNumber = await generateNextQueueNumber(roomId, transaction)

        await existingQueue.update({
          queueNumber: candidateNumber,
          status: 'waiting'
        }, { transaction })

        await transaction.commit()
        await broadcastAllRooms()

        return res.json({
          code: 200,
          message: '排号成功',
          data: existingQueue
        })
      }
    }

    let queueNumber = ''
    if (customerId || (companyId && room.type === 'public')) {
      queueNumber = await generateNextQueueNumber(roomId, transaction)
    }

    const queue = await db.Queue.create({
      customerId,
      companyId,
      roomId,
      queueNumber,
      status: 'waiting'
    }, { transaction })

    await transaction.commit()
    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '添加成功',
      data: queue
    })
  } catch (error) {
    await transaction.rollback()
    console.error('Add queue error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/batch-call/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params
    const { count = 10 } = req.body

    const room = await db.MeetingRoom.findByPk(roomId)
    if (!room) {
      return res.json({ code: 404, message: '洽谈室不存在' })
    }

    const waitingQueues = await db.Queue.findAll({
      where: {
        roomId,
        status: 'waiting',
        completed: false
      },
      order: [['createdAt', 'ASC']],
      limit: count
    })

    if (waitingQueues.length === 0) {
      return res.json({ code: 400, message: '没有等待叫号的排号' })
    }

    const callCount = Math.min(waitingQueues.length, count)
    const firstQueue = waitingQueues[0]
    const lastQueue = waitingQueues[callCount - 1]

    const firstNumber = firstQueue.queueNumber?.split('_')[1] || ''
    const lastNumber = lastQueue.queueNumber?.split('_')[1] || ''

    for (let i = 0; i < callCount; i++) {
      await waitingQueues[i].update({
        status: 'called',
        calledAt: new Date()
      })
    }

    broadcast({
      type: 'batch_call',
      roomId,
      roomName: room.name,
      firstNumber,
      lastNumber,
      callCount,
      timestamp: new Date().toISOString()
    })

    await broadcastAllRooms()

    res.json({
      code: 200,
      message: `已叫号${callCount}个`,
      data: {
        firstNumber,
        lastNumber,
        callCount,
        calledQueues: waitingQueues.slice(0, callCount)
      }
    })
  } catch (error) {
    console.error('Batch call error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/call/:queueId', async (req, res) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { queueId } = req.params

    const queue = await db.Queue.findByPk(queueId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    if (!queue) {
      await transaction.rollback()
      return res.json({ code: 404, message: '排号不存在' })
    }

    if (queue.status === 'called') {
      await transaction.rollback()
      return res.json({ code: 400, message: '该排号已被呼叫' })
    }

    if (!queue.queueNumber) {
      const candidateNumber = await generateNextQueueNumber(queue.roomId, transaction)
      await queue.update({ queueNumber: candidateNumber }, { transaction })
    }

    await queue.update({
      status: 'called',
      calledAt: new Date()
    }, { transaction })

    const room = await db.MeetingRoom.findByPk(queue.roomId, { transaction })

    await transaction.commit()

    broadcast({
      type: 'call',
      roomId: queue.roomId,
      roomName: room ? room.name : '',
      queueNumber: queue.queueNumber ? queue.queueNumber.split('_')[1] : '',
      timestamp: new Date().toISOString()
    })

    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '叫号成功',
      data: queue
    })
  } catch (error) {
    await transaction.rollback()
    console.error('Call queue error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/cancel/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params

    const queue = await db.Queue.findByPk(queueId)

    if (!queue) {
      return res.json({ code: 404, message: '排号不存在' })
    }

    if (queue.completed) {
      return res.json({ code: 400, message: '该排号已完成，无法取消' })
    }

    await queue.update({ status: 'cancelled' })

    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '取消成功'
    })
  } catch (error) {
    console.error('Cancel queue error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/requeue/:queueId', async (req, res) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { queueId } = req.params

    const queue = await db.Queue.findByPk(queueId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    if (!queue) {
      await transaction.rollback()
      return res.json({ code: 404, message: '排号不存在' })
    }

    if (queue.completed) {
      await transaction.rollback()
      return res.json({ code: 400, message: '已完成的排号无法重排' })
    }

    if (queue.status !== 'called' && queue.queueNumber) {
      await transaction.rollback()
      return res.json({ code: 400, message: '该排号还未被叫号，无法重排' })
    }

    const room = await db.MeetingRoom.findByPk(queue.roomId, { transaction })
    if (!room) {
      await transaction.rollback()
      return res.json({ code: 404, message: '洽谈室不存在' })
    }

    const newQueueNumber = await generateRequeueNumber(queue, transaction)

    await queue.update({
      queueNumber: newQueueNumber,
      status: 'waiting',
      calledAt: null
    }, { transaction })

    await transaction.commit()
    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '重排成功',
      data: queue
    })
  } catch (error) {
    await transaction.rollback()
    console.error('Requeue error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/complete/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params

    const queue = await db.Queue.findByPk(queueId)

    if (!queue) {
      return res.json({ code: 404, message: '排号不存在' })
    }

    if (queue.status !== 'called') {
      return res.json({ code: 400, message: '该排号还未被叫号，无法标记为已完成' })
    }

    await queue.update({
      completed: true,
      completedAt: new Date(),
      status: 'completed'
    })

    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '标记完成成功',
      data: queue
    })
  } catch (error) {
    console.error('Complete queue error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/update', async (req, res) => {
  try {
    const { id, queueNumber, status } = req.body

    const queue = await db.Queue.findByPk(id)

    if (!queue) {
      return res.json({ code: 404, message: '排号不存在' })
    }

    await queue.update({
      queueNumber,
      status
    })

    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '更新成功',
      data: queue
    })
  } catch (error) {
    console.error('Update queue error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router
