const express = require('express')
const router = express.Router()
const db = require('../models')

// 合并货号（去重，保留已有货号）
const mergeItemNumbers = (existingStr, newStr) => {
  if (!existingStr || existingStr === '') {
    return newStr || ''
  }
  if (!newStr || newStr === '') {
    return existingStr
  }
  const existingList = existingStr.split(',').map(n => n.trim()).filter(n => n)
  const newList = newStr.split(',').map(n => n.trim()).filter(n => n)
  const mergedSet = new Set([...existingList, ...newList])
  return Array.from(mergedSet).join(',')
}

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query
    
    console.log('Company list query:', { page, pageSize, keyword })
    
    const where = { status: 1 }
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { companyName: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    
    const { count, rows } = await db.Company.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    })
    
    console.log('Company list result:', { count, rows: rows.length })
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count
      }
    })
  } catch (error) {
    console.error('Get company list error:', error)
    res.json({ code: 500, message: 'Server error' })
  }
})

router.get('/detail/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params
    
    const company = await db.Company.findOne({
      where: { id: companyId, status: 1 }
    })
    
    if (!company) {
      return res.json({ code: 404, message: 'Company not found' })
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: company
    })
  } catch (error) {
    console.error('Get company detail error:', error)
    res.json({ code: 500, message: 'Server error' })
  }
})

router.post('/add', async (req, res) => {
  try {
    const { companyName, phone, itemNumber } = req.body
    
    if (!companyName || !phone) {
      return res.json({ code: 400, message: '请填写完整信息' })
    }
    
    // 先查找或创建厂商
    let company = await db.Company.findOne({
      where: {
        companyName,
        phone,
        status: 1
      }
    })
    
    if (!company) {
      // 如果不存在，创建新厂商
      company = await db.Company.create({
        companyName,
        phone,
        itemNumber: itemNumber || ''
      })
    } else if (itemNumber !== undefined && itemNumber !== null && itemNumber !== '') {
      // 如果已存在且提供了货号，追加货号（去重）
      const mergedItemNumber = mergeItemNumbers(company.itemNumber, itemNumber)
      await company.update({ itemNumber: mergedItemNumber })
    }
    
    res.json({
      code: 200,
      message: '添加成功',
      data: company
    })
  } catch (error) {
    console.error('Add company error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/batch-add', async (req, res) => {
  try {
    const { companies, roomId } = req.body

    if (!Array.isArray(companies) || companies.length === 0) {
      return res.json({ code: 400, message: '请提供厂商数据' })
    }

    if (!roomId) {
      return res.json({ code: 400, message: '请选择洽谈室' })
    }

    const room = await db.MeetingRoom.findByPk(roomId)
    if (!room) {
      return res.json({ code: 404, message: '洽谈室不存在' })
    }

    const results = []
    const errors = []

    for (let i = 0; i < companies.length; i++) {
      const { companyName, phone } = companies[i]

      if (!companyName || !phone) {
        errors.push({ index: i + 1, message: '厂商名称或手机号为空' })
        continue
      }

      let company = await db.Company.findOne({
        where: { companyName, phone, status: 1 }
      })

      if (!company) {
        company = await db.Company.create({ companyName, phone, itemNumber: companies[i].itemNumber || '' })
      } else if (companies[i].itemNumber !== undefined && companies[i].itemNumber !== null && companies[i].itemNumber !== '') {
        // 如果已存在且提供了货号，追加货号（去重）
        const mergedItemNumber = mergeItemNumbers(company.itemNumber, companies[i].itemNumber)
        await company.update({ itemNumber: mergedItemNumber })
      }

      const existingQueue = await db.Queue.findOne({
        where: {
          companyId: company.id,
          roomId,
          completed: false
        }
      })

      if (existingQueue) {
        errors.push({ index: i + 1, companyName, message: '该洽谈室已存在该厂商的排号记录' })
        continue
      }

      let queueNumber = ''
      if (room.type === 'public') {
        // 查询今天该洽谈室所有排号
        const todayQueues = await db.Queue.findAll({
          where: {
            roomId,
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
        while (await db.Queue.findOne({ where: { queueNumber: candidateNumber } })) {
          nextNum++
          candidateNumber = `${roomId}_${String(nextNum).padStart(3, '0')}`
        }

        queueNumber = candidateNumber
      }

      const queue = await db.Queue.create({
        companyId: company.id,
        roomId,
        queueNumber,
        status: 'waiting'
      })

      results.push({ company, queue })
    }

    const { broadcastRoomUpdate, broadcast } = require('../websocket')
    const meetings = await db.MeetingRoom.findAll({
      where: { status: 'occupied' },
      order: [['id', 'ASC']]
    })
    const result = await Promise.all(meetings.map(async (meeting) => {
      const meetingData = meeting.toJSON()
      const queues = await db.Queue.findAll({
        where: { roomId: meeting.id, completed: false },
        order: [['createdAt', 'ASC']]
      })
      const calledQueues = queues.filter(q => q.status === 'called')
      const currentQueue = calledQueues.length > 0 ? calledQueues[calledQueues.length - 1] : null
      const waitingQueues = queues.filter(q => q.status === 'waiting')
      return {
        ...meetingData,
        currentNumber: currentQueue ? currentQueue.queueNumber?.split('_')[1] || '000' : '000',
        nextNumber: waitingQueues.length > 0 ? waitingQueues[0].queueNumber?.split('_')[1] || '000' : '000',
        waitingTime: waitingQueues.length > 0 ? Math.max(1, Math.floor(waitingQueues.length * 2)) : 0
      }
    }))
    broadcastRoomUpdate(result)

    res.json({
      code: 200,
      message: `成功导入${results.length}条${errors.length > 0 ? `，${errors.length}条跳过` : ''}`,
      data: {
        successCount: results.length,
        failCount: errors.length,
        errors
      }
    })
  } catch (error) {
    console.error('Batch add company error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/update', async (req, res) => {
  try {
    const { id, companyName, phone, itemNumber } = req.body
    
    if (!id) {
      return res.json({ code: 400, message: 'Missing company ID' })
    }
    
    const company = await db.Company.findOne({
      where: { id, status: 1 }
    })
    
    if (!company) {
      return res.json({ code: 404, message: 'Company not found' })
    }
    
    await company.update({
      companyName: companyName || company.companyName,
      phone: phone || company.phone,
      itemNumber: itemNumber !== undefined ? itemNumber : company.itemNumber
    })
    
    res.json({
      code: 200,
      message: 'Update success',
      data: company
    })
  } catch (error) {
    console.error('Update company error:', error)
    res.json({ code: 500, message: 'Server error' })
  }
})

router.post('/delete/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params
    
    const company = await db.Company.findOne({
      where: { id: companyId, status: 1 }
    })
    
    if (!company) {
      return res.json({ code: 404, message: 'Company not found' })
    }
    
    await company.update({ status: 0 })
    
    res.json({
      code: 200,
      message: 'Delete success'
    })
  } catch (error) {
    console.error('Delete company error:', error)
    res.json({ code: 500, message: 'Server error' })
  }
})

module.exports = router