const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/list', async (req, res) => {
  try {
    const { status, keyword } = req.query
    const where = {}
    
    if (status) {
      where.status = status
    }
    
    if (keyword) {
      where.name = { [db.Sequelize.Op.like]: `%${keyword}%` }
    }
    
    const meetings = await db.MeetingRoom.findAll({
      where,
      order: [['id', 'ASC']]
    })
    
    const result = await Promise.all(meetings.map(async (meeting) => {
      const meetingData = meeting.toJSON()
      
      const queues = await db.Queue.findAll({
        where: { 
          roomId: meeting.id,
          completed: false
        },
        order: [['createdAt', 'ASC']]
      })
      
      const sortQueuesByNumber = (a, b) => {
        if (!a.queueNumber) return 1
        if (!b.queueNumber) return -1
        const partsA = a.queueNumber.split('_')[1].split('-')
        const partsB = b.queueNumber.split('_')[1].split('-')
        const numA = parseInt(partsA[0])
        const numB = parseInt(partsB[0])
        if (numA !== numB) return numA - numB
        const suffixA = partsA.length > 1 ? parseInt(partsA[1]) : 0
        const suffixB = partsB.length > 1 ? parseInt(partsB[1]) : 0
        return suffixA - suffixB
      }

      const calledQueues = queues
        .filter(q => q.status === 'called')
        .sort(sortQueuesByNumber)
      const currentQueue = calledQueues.length > 0 ? calledQueues[calledQueues.length - 1] : null
      const waitingQueues = queues
        .filter(q => q.status === 'waiting')
        .sort(sortQueuesByNumber)
      
      meetingData.currentNumber = currentQueue ? currentQueue.queueNumber?.split('_')[1] || '000' : '000'
      meetingData.nextNumber = waitingQueues.length > 0 ? waitingQueues[0].queueNumber?.split('_')[1] || '000' : '000'
      meetingData.waitingTime = waitingQueues.length > 0 ? Math.max(1, Math.floor(waitingQueues.length * 2)) : 0
      
      return meetingData
    }))
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: result,
        total: result.length
      }
    })
  } catch (error) {
    console.error('获取洽谈室列表失败:', error)
    res.json({
      code: 500,
      message: '获取洽谈室列表失败',
      data: null
    })
  }
})

router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params
    const meeting = await db.MeetingRoom.findByPk(id)
    
    if (!meeting) {
      return res.json({
        code: 404,
        message: '洽谈室不存在',
        data: null
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: meeting
    })
  } catch (error) {
    console.error('获取洽谈室详情失败:', error)
    res.json({
      code: 500,
      message: '获取洽谈室详情失败',
      data: null
    })
  }
})

router.post('/add', async (req, res) => {
  try {
    const { name, type, status, companyName, visitRequirement } = req.body
    
    if (!name) {
      return res.json({
        code: 400,
        message: '洽谈室名称不能为空',
        data: null
      })
    }
    
    const meeting = await db.MeetingRoom.create({
      name,
      type: type || 'public',
      status: status || 'free',
      companyName: companyName || null,
      visitRequirement: visitRequirement || null
    })
    
    res.json({
      code: 200,
      message: '新增成功',
      data: meeting
    })
  } catch (error) {
    console.error('新增洽谈室失败:', error)
    res.json({
      code: 500,
      message: '新增洽谈室失败',
      data: null
    })
  }
})

router.post('/update', async (req, res) => {
  try {
    const { id, name, type, status, companyName, visitRequirement, quotePoints } = req.body
    
    if (!id) {
      return res.json({
        code: 400,
        message: '洽谈室ID不能为空',
        data: null
      })
    }
    
    const meeting = await db.MeetingRoom.findByPk(id)
    if (!meeting) {
      return res.json({
        code: 404,
        message: '洽谈室不存在',
        data: null
      })
    }
    
    await meeting.update({
      name: name !== undefined ? name : meeting.name,
      type: type !== undefined ? type : meeting.type,
      status: status !== undefined ? status : meeting.status,
      companyName: companyName !== undefined ? companyName : meeting.companyName,
      visitRequirement: visitRequirement !== undefined ? visitRequirement : meeting.visitRequirement,
      quotePoints: quotePoints !== undefined ? quotePoints : meeting.quotePoints
    })
    
    res.json({
      code: 200,
      message: '更新成功',
      data: meeting
    })
  } catch (error) {
    console.error('更新洽谈室失败:', error)
    res.json({
      code: 500,
      message: '更新洽谈室失败',
      data: null
    })
  }
})

router.post('/enable', async (req, res) => {
  try {
    const { id } = req.body
    
    if (!id) {
      return res.json({
        code: 400,
        message: '洽谈室ID不能为空',
        data: null
      })
    }
    
    const meeting = await db.MeetingRoom.findByPk(id)
    if (!meeting) {
      return res.json({
        code: 404,
        message: '洽谈室不存在',
        data: null
      })
    }
    
    await meeting.update({ status: 'occupied' })
    
    res.json({
      code: 200,
      message: '启用成功',
      data: meeting
    })
  } catch (error) {
    console.error('启用洽谈室失败:', error)
    res.json({
      code: 500,
      message: '启用洽谈室失败',
      data: null
    })
  }
})

router.post('/pause', async (req, res) => {
  try {
    const { id } = req.body
    
    if (!id) {
      return res.json({
        code: 400,
        message: '洽谈室ID不能为空',
        data: null
      })
    }
    
    const meeting = await db.MeetingRoom.findByPk(id)
    if (!meeting) {
      return res.json({
        code: 404,
        message: '洽谈室不存在',
        data: null
      })
    }
    
    await meeting.update({ status: 'disabled' })
    
    res.json({
      code: 200,
      message: '暂停成功',
      data: meeting
    })
  } catch (error) {
    console.error('暂停洽谈室失败:', error)
    res.json({
      code: 500,
      message: '暂停洽谈室失败',
      data: null
    })
  }
})

router.post('/close', async (req, res) => {
  try {
    const { id } = req.body
    
    if (!id) {
      return res.json({
        code: 400,
        message: '洽谈室ID不能为空',
        data: null
      })
    }
    
    const meeting = await db.MeetingRoom.findByPk(id)
    if (!meeting) {
      return res.json({
        code: 404,
        message: '洽谈室不存在',
        data: null
      })
    }
    
    // 获取该洽谈室的排号数据
    const queues = await db.Queue.findAll({
      where: { roomId: id },
      order: [['createdAt', 'ASC']]
    })

    const restoreData = {
      status: meeting.status,
      type: meeting.type,
      companyName: meeting.companyName,
      visitRequirement: meeting.visitRequirement,
      quotePoints: meeting.quotePoints,
      queues: queues.map(q => ({
        id: q.id,
        queueNumber: q.queueNumber,
        customerName: q.customerName,
        companyName: q.companyName,
        status: q.status,
        roomId: q.roomId,
        createdAt: q.createdAt
      }))
    }

    // 关闭时重置洽谈室状态，取消所有排号记录
    await meeting.update({ 
      status: 'free',
      companyName: null,
      visitRequirement: null,
      quotePoints: null
    })

    // 取消该洽谈室所有排号记录，以便恢复时不冲突
    await db.Queue.update(
      { status: 'cancelled' },
      { where: { roomId: id, status: { [db.Sequelize.Op.ne]: 'cancelled' } } }
    )
    
    res.json({
      code: 200,
      message: '关闭成功',
      data: {
        ...meeting.toJSON(),
        restoreData
      }
    })
  } catch (error) {
    console.error('关闭洽谈室失败:', error)
    res.json({
      code: 500,
      message: '关闭洽谈室失败',
      data: null
    })
  }
})

router.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const meeting = await db.MeetingRoom.findByPk(id)
    if (!meeting) {
      return res.json({
        code: 404,
        message: '洽谈室不存在',
        data: null
      })
    }
    
    await meeting.destroy()
    
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    })
  } catch (error) {
    console.error('删除洽谈室失败:', error)
    res.json({
      code: 500,
      message: '删除洽谈室失败',
      data: null
    })
  }
})

// 恢复洽谈室数据
router.post('/restore', async (req, res) => {
  try {
    const { id, restoreData } = req.body
    
    if (!id || !restoreData) {
      return res.json({
        code: 400,
        message: '参数不完整',
        data: null
      })
    }
    
    const meeting = await db.MeetingRoom.findByPk(id)
    if (!meeting) {
      return res.json({
        code: 404,
        message: '洽谈室不存在',
        data: null
      })
    }
    
    await meeting.update({
      status: restoreData.status || 'occupied',
      type: restoreData.type || meeting.type,
      companyName: restoreData.companyName || null,
      visitRequirement: restoreData.visitRequirement || null,
      quotePoints: restoreData.quotePoints || null
    })
    
    // 恢复排号数据（将排号的 roomId 重新关联）
    if (restoreData.queues && restoreData.queues.length > 0) {
      for (const queue of restoreData.queues) {
        await db.Queue.update(
          { roomId: id },
          { where: { id: queue.id } }
        )
      }
    }
    
    res.json({
      code: 200,
      message: '恢复成功',
      data: meeting
    })
  } catch (error) {
    console.error('恢复洽谈室失败:', error)
    res.json({
      code: 500,
      message: '恢复洽谈室失败',
      data: null
    })
  }
})

module.exports = router