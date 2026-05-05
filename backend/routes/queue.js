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
  try {
    const { customerId, companyId, roomId } = req.body

    if (!roomId || (!customerId && !companyId)) {
      return res.json({ code: 400, message: '请填写完整信息' })
    }

    const room = await db.MeetingRoom.findByPk(roomId)
    if (!room) {
      return res.json({ code: 404, message: '洽谈室不存在' })
    }

    if (customerId) {
      const customer = await db.Customer.findByPk(customerId)
      if (!customer) {
        return res.json({ code: 404, message: '客户不存在' })
      }

      const existingCustomerQueue = await db.Queue.findOne({
        where: {
          customerId,
          roomId,
          completed: false,
          status: { [db.Sequelize.Op.ne]: 'cancelled' }
        }
      })

      if (existingCustomerQueue) {
        return res.json({ code: 400, message: '该洽谈室已存在该客户的排号记录' })
      }
    }

    if (companyId) {
      const company = await db.Company.findByPk(companyId)
      if (!company) {
        return res.json({ code: 404, message: '厂商不存在' })
      }

      const existingQueue = await db.Queue.findOne({
        where: {
          companyId,
          roomId,
          completed: false,
          status: { [db.Sequelize.Op.ne]: 'cancelled' }
        }
      })

      if (existingQueue) {
        if (existingQueue.queueNumber) {
          return res.json({ code: 400, message: '该洽谈室已存在该厂商的排号记录' })
        }

        const room = await db.MeetingRoom.findByPk(roomId)
        const todayStart = new Date(new Date().toDateString())
        const todayQueues = await db.Queue.findAll({
          where: {
            roomId,
            status: { [db.Sequelize.Op.ne]: 'cancelled' },
            createdAt: { [db.Sequelize.Op.gte]: todayStart }
          }
        })

        const existingNumbers = todayQueues
          .filter(q => q.queueNumber && !q.queueNumber.includes('-'))
          .map(q => parseInt(q.queueNumber.split('_')[1]))

        let nextNum = 1
        if (existingNumbers.length > 0) {
          nextNum = Math.max(...existingNumbers) + 1
        }

        let candidateNumber = `${roomId}_${String(nextNum).padStart(3, '0')}`
        while (await db.Queue.findOne({ where: { queueNumber: candidateNumber } })) {
          nextNum++
          candidateNumber = `${roomId}_${String(nextNum).padStart(3, '0')}`
        }

        await existingQueue.update({
          queueNumber: candidateNumber,
          status: 'waiting'
        })

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
      // 查询今天该洽谈室所有非取消状态的排号
      const todayQueues = await db.Queue.findAll({
        where: {
          roomId,
          status: { [db.Sequelize.Op.ne]: 'cancelled' },
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(new Date().toDateString())
          }
        }
      })

      // 找到最大的已使用号码
      const existingNumbers = todayQueues
        .filter(q => q.queueNumber && !q.queueNumber.includes('-'))
        .map(q => parseInt(q.queueNumber.split('_')[1]))

      let nextNum = 1
      if (existingNumbers.length > 0) {
        nextNum = Math.max(...existingNumbers) + 1
      }

      let candidateNumber = `${roomId}_${String(nextNum).padStart(3, '0')}`

      // 双重检查，确保号码不存在
      while (await db.Queue.findOne({
        where: {
          queueNumber: candidateNumber
        }
      })) {
        nextNum++
        candidateNumber = `${roomId}_${String(nextNum).padStart(3, '0')}`
      }

      queueNumber = candidateNumber
    }

    const queue = await db.Queue.create({
      customerId,
      companyId,
      roomId,
      queueNumber,
      status: 'waiting'
    })

    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '添加成功',
      data: queue
    })
  } catch (error) {
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
  try {
    const { queueId } = req.params

    const queue = await db.Queue.findByPk(queueId)

    if (!queue) {
      return res.json({ code: 404, message: '排号不存在' })
    }

    if (queue.status === 'called') {
      return res.json({ code: 400, message: '该排号已被呼叫' })
    }

    if (!queue.queueNumber) {
      const room = await db.MeetingRoom.findByPk(queue.roomId)
      const todayStart = new Date(new Date().toDateString())
      const todayQueues = await db.Queue.findAll({
        where: {
          roomId: queue.roomId,
          status: { [db.Sequelize.Op.ne]: 'cancelled' },
          createdAt: { [db.Sequelize.Op.gte]: todayStart }
        }
      })

      const existingNumbers = todayQueues
        .filter(q => q.queueNumber && !q.queueNumber.includes('-'))
        .map(q => parseInt(q.queueNumber.split('_')[1]))

      let nextNum = 1
      if (existingNumbers.length > 0) {
        nextNum = Math.max(...existingNumbers) + 1
      }

      let candidateNumber = `${queue.roomId}_${String(nextNum).padStart(3, '0')}`
      while (await db.Queue.findOne({ where: { queueNumber: candidateNumber } })) {
        nextNum++
        candidateNumber = `${queue.roomId}_${String(nextNum).padStart(3, '0')}`
      }

      await queue.update({ queueNumber: candidateNumber })
    }

    await queue.update({
      status: 'called',
      calledAt: new Date()
    })

    const room = await db.MeetingRoom.findByPk(queue.roomId)

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
  try {
    const { queueId } = req.params

    const queue = await db.Queue.findByPk(queueId)

    if (!queue) {
      return res.json({ code: 404, message: '排号不存在' })
    }

    if (queue.completed) {
      return res.json({ code: 400, message: '已完成的排号无法重排' })
    }

    if (queue.status !== 'called' && queue.queueNumber) {
      return res.json({ code: 400, message: '该排号还未被叫号，无法重排' })
    }

    const room = await db.MeetingRoom.findByPk(queue.roomId)
    if (!room) {
      return res.json({ code: 404, message: '洽谈室不存在' })
    }

    const todayStart = new Date(new Date().toDateString())

    const allQueues = await db.Queue.findAll({
      where: {
        roomId: queue.roomId,
        status: { [db.Sequelize.Op.ne]: 'cancelled' },
        createdAt: { [db.Sequelize.Op.gte]: todayStart }
      }
    })

    let newQueueNumber = ''

    if (!queue.queueNumber) {
      const existingNumbers = allQueues
        .filter(q => q.queueNumber && !q.queueNumber.includes('-'))
        .map(q => parseInt(q.queueNumber.split('_')[1]))

      // 找到最大的已使用号码，然后 +1，确保不会重复使用旧号码
      let nextNum = 1
      if (existingNumbers.length > 0) {
        nextNum = Math.max(...existingNumbers) + 1
      }

      newQueueNumber = `${queue.roomId}_${String(nextNum).padStart(3, '0')}`
    } else {
      const calledQueues = allQueues.filter(q => q.status === 'called')

      let currentCallNum = 0
      calledQueues.forEach(q => {
        if (q.queueNumber) {
          const basePart = q.queueNumber.split('-')[0]
          const num = parseInt(basePart.split('_')[1])
          if (num > currentCallNum) currentCallNum = num
        }
      })

      const waitingQueues = allQueues.filter(q => q.status === 'waiting' && q.queueNumber)
      const countAfterCurrent = waitingQueues.filter(q => {
        const basePart = q.queueNumber.split('-')[0]
        const num = parseInt(basePart.split('_')[1])
        return num > currentCallNum
      }).length

      const allBaseNums = allQueues
        .filter(q => q.queueNumber)
        .map(q => parseInt(q.queueNumber.split('-')[0].split('_')[1]))
        .sort((a, b) => a - b)

      const maxBaseNum = allBaseNums.length > 0 ? allBaseNums[allBaseNums.length - 1] : 0

      if (countAfterCurrent >= 3) {
        let baseNumber = currentCallNum + 3
        while (true) {
          let found = false
          for (let suffix = 1; suffix <= 3; suffix++) {
            const candidate = `${queue.roomId}_${String(baseNumber).padStart(3, '0')}-${suffix}`
            if (!allQueues.some(q => q.queueNumber === candidate)) {
              newQueueNumber = candidate
              found = true
              break
            }
          }
          if (found) break
          let nextBase = -1
          for (let i = 0; i < allBaseNums.length; i++) {
            if (allBaseNums[i] > baseNumber) {
              nextBase = allBaseNums[i]
              break
            }
          }
          if (nextBase > 0) {
            baseNumber = nextBase
          } else {
            newQueueNumber = `${queue.roomId}_${String(baseNumber + 1).padStart(3, '0')}`
            break
          }
        }
      } else {
        newQueueNumber = `${queue.roomId}_${String(maxBaseNum + 1).padStart(3, '0')}`
        while (allQueues.some(q => q.queueNumber === newQueueNumber)) {
          const num = parseInt(newQueueNumber.split('_')[1]) + 1
          newQueueNumber = `${queue.roomId}_${String(num).padStart(3, '0')}`
        }
      }
    }

    await queue.update({
      queueNumber: newQueueNumber,
      status: 'waiting',
      calledAt: null
    })

    await broadcastAllRooms()

    res.json({
      code: 200,
      message: '重排成功',
      data: queue
    })
  } catch (error) {
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