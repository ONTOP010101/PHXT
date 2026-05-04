const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/banner', async (req, res) => {
  try {
    let banner = await db.MiniAppBanner.findOne()

    if (!banner) {
      banner = await db.MiniAppBanner.create({
        tag: 'NOTICE',
        title: '2024广州玩具展览会\n厂商专属排号服务',
        desc: '实时叫号 · 无需等候 · 高效洽谈',
        btnText: '立即查号'
      })
    }

    res.json({
      code: 200,
      message: 'success',
      data: banner
    })
  } catch (error) {
    console.error('获取Banner失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/banner', async (req, res) => {
  try {
    const { tag, title, desc, btnText } = req.body

    let banner = await db.MiniAppBanner.findOne()

    if (!banner) {
      banner = await db.MiniAppBanner.create({
        tag: tag || 'NOTICE',
        title: title || '',
        desc: desc || '',
        btnText: btnText || '立即查号'
      })
    } else {
      await banner.update({
        tag: tag !== undefined ? tag : banner.tag,
        title: title !== undefined ? title : banner.title,
        desc: desc !== undefined ? desc : banner.desc,
        btnText: btnText !== undefined ? btnText : banner.btnText
      })
    }

    res.json({
      code: 200,
      message: '保存成功',
      data: banner
    })
  } catch (error) {
    console.error('保存Banner失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/notices', async (req, res) => {
  try {
    const notices = await db.MiniAppNotice.findAll({
      order: [['sort', 'ASC'], ['createdAt', 'DESC']]
    })

    res.json({
      code: 200,
      message: 'success',
      data: notices
    })
  } catch (error) {
    console.error('获取公告列表失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/notices/:id', async (req, res) => {
  try {
    const notice = await db.MiniAppNotice.findByPk(req.params.id)

    if (!notice) {
      return res.json({ code: 404, message: '公告不存在' })
    }

    res.json({
      code: 200,
      message: 'success',
      data: notice
    })
  } catch (error) {
    console.error('获取公告详情失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/notices', async (req, res) => {
  try {
    const { image, tag, tagBg, tagColor, date, title, desc, sort, status } = req.body

    const notice = await db.MiniAppNotice.create({
      image: image || '',
      tag: tag || '',
      tagBg: tagBg || '#dcfce7',
      tagColor: tagColor || '#16a34a',
      date: date || '',
      title: title || '',
      desc: desc || '',
      sort: sort || 0,
      status: status || 'published'
    })

    res.json({
      code: 200,
      message: '创建成功',
      data: notice
    })
  } catch (error) {
    console.error('创建公告失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/notices/:id', async (req, res) => {
  try {
    const notice = await db.MiniAppNotice.findByPk(req.params.id)

    if (!notice) {
      return res.json({ code: 404, message: '公告不存在' })
    }

    const { image, tag, tagBg, tagColor, date, title, desc, sort, status } = req.body

    await notice.update({
      image: image !== undefined ? image : notice.image,
      tag: tag !== undefined ? tag : notice.tag,
      tagBg: tagBg !== undefined ? tagBg : notice.tagBg,
      tagColor: tagColor !== undefined ? tagColor : notice.tagColor,
      date: date !== undefined ? date : notice.date,
      title: title !== undefined ? title : notice.title,
      desc: desc !== undefined ? desc : notice.desc,
      sort: sort !== undefined ? sort : notice.sort,
      status: status !== undefined ? status : notice.status
    })

    res.json({
      code: 200,
      message: '更新成功',
      data: notice
    })
  } catch (error) {
    console.error('更新公告失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/notices/delete/:id', async (req, res) => {
  try {
    const notice = await db.MiniAppNotice.findByPk(req.params.id)

    if (!notice) {
      return res.json({ code: 404, message: '公告不存在' })
    }

    await notice.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除公告失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/getNotices', async (req, res) => {
  try {
    const banner = await db.MiniAppBanner.findOne()
    const notices = await db.MiniAppNotice.findAll({
      where: { status: 'published' },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']]
    })

    res.json({
      code: 200,
      message: 'success',
      data: {
        banner: banner || {
          tag: 'NOTICE',
          title: '2024广州玩具展览会\n厂商专属排号服务',
          desc: '实时叫号 · 无需等候 · 高效洽谈',
          btnText: '立即查号'
        },
        notices: notices
      }
    })
  } catch (error) {
    console.error('获取小程序首页数据失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

// 获取洽谈室列表（小程序用）
router.get('/rooms', async (req, res) => {
  try {
    const meetings = await db.MeetingRoom.findAll({
      where: { 
        status: { [db.Sequelize.Op.ne]: 'disabled' } 
      },
      order: [['id', 'ASC']]
    })
    
    const rooms = await Promise.all(meetings.map(async (meeting) => {
      const meetingData = meeting.toJSON()
      
      const queues = await db.Queue.findAll({
        where: { 
          roomId: meeting.id,
          completed: false
        },
        order: [['createdAt', 'ASC']]
      })
      
      const calledQueues = queues.filter(q => q.status === 'called')
      const currentQueue = calledQueues.length > 0 ? calledQueues[calledQueues.length - 1] : null
      const waitingQueues = queues.filter(q => q.status === 'waiting')
      
      const currentNum = currentQueue ? currentQueue.queueNumber?.split('_')[1] || '001' : '001'
      const nextNum = waitingQueues.length > 0 ? waitingQueues[0].queueNumber?.split('_')[1] || '001' : '001'
      
      return {
        id: meetingData.id,
        name: meetingData.name,
        current_number: `${meetingData.id}_${currentNum}`,
        next_number: `${meetingData.id}_${nextNum}`,
        wait_time: waitingQueues.length > 0 ? Math.max(1, waitingQueues.length * 2) : 0,
        total: 1000,
        current: parseInt(currentNum)
      }
    }))
    
    res.json({
      code: 200,
      message: '获取成功',
      data: rooms
    })
  } catch (error) {
    console.error('获取洽谈室列表失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

// 小程序用户列表
router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query

    const where = { status: 1 }
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { companyName: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { wxid: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }

    const { count, rows } = await db.Company.findAndCountAll({
      where,
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
    console.error('获取小程序用户列表失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

// 小程序用户详情
router.get('/users/:id', async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { id: req.params.id, status: 1 }
    })

    if (!company) {
      return res.json({ code: 404, message: '用户不存在' })
    }

    const queueCount = await db.Queue.count({
      where: { companyId: company.id }
    })

    const completedCount = await db.Queue.count({
      where: { companyId: company.id, completed: true }
    })

    res.json({
      code: 200,
      message: 'success',
      data: {
        ...company.toJSON(),
        queueCount,
        completedCount
      }
    })
  } catch (error) {
    console.error('获取小程序用户详情失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

// 小程序用户编辑
router.post('/users/update', async (req, res) => {
  try {
    const { id, companyName, phone, wxid } = req.body

    if (!id) {
      return res.json({ code: 400, message: '缺少用户ID' })
    }

    const company = await db.Company.findOne({
      where: { id, status: 1 }
    })

    if (!company) {
      return res.json({ code: 404, message: '用户不存在' })
    }

    await company.update({
      companyName: companyName !== undefined ? companyName : company.companyName,
      phone: phone !== undefined ? phone : company.phone,
      wxid: wxid !== undefined ? wxid : company.wxid
    })

    res.json({
      code: 200,
      message: '更新成功',
      data: company
    })
  } catch (error) {
    console.error('更新小程序用户失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

// 小程序用户删除
router.post('/users/delete/:id', async (req, res) => {
  try {
    const company = await db.Company.findOne({
      where: { id: req.params.id, status: 1 }
    })

    if (!company) {
      return res.json({ code: 404, message: '用户不存在' })
    }

    await company.update({ status: 0 })

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除小程序用户失败:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router
