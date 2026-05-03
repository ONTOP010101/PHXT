const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query
    
    const where = { status: 1 }
    if (keyword) {
      where[db.Sequelize.Op.or] = [
        { companyName: { [db.Sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${keyword}%` } }
      ]
    }
    
    const { count, rows } = await db.Customer.findAndCountAll({
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
    console.error('Get customer list error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.get('/detail/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params
    
    const customer = await db.Customer.findOne({
      where: { id: customerId, status: 1 }
    })
    
    if (!customer) {
      return res.json({ code: 404, message: '客户不存在' })
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: customer
    })
  } catch (error) {
    console.error('Get customer detail error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/add', async (req, res) => {
  try {
    const { companyName, phone, contactPerson } = req.body
    
    if (!companyName || !phone) {
      return res.json({ code: 400, message: '请填写完整信息' })
    }
    
    let customer = await db.Customer.findOne({
      where: { companyName, phone, status: 1 }
    })
    
    if (!customer) {
      customer = await db.Customer.create({
        companyName,
        phone,
        contactPerson
      })
    }
    
    res.json({
      code: 200,
      message: '添加成功',
      data: customer
    })
  } catch (error) {
    console.error('Add customer error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/update', async (req, res) => {
  try {
    const { id, companyName, phone, contactPerson } = req.body
    
    if (!id) {
      return res.json({ code: 400, message: '缺少客户ID' })
    }
    
    const customer = await db.Customer.findOne({
      where: { id, status: 1 }
    })
    
    if (!customer) {
      return res.json({ code: 404, message: '客户不存在' })
    }
    
    await customer.update({
      companyName: companyName || customer.companyName,
      phone: phone || customer.phone,
      contactPerson: contactPerson !== undefined ? contactPerson : customer.contactPerson
    })
    
    res.json({
      code: 200,
      message: '更新成功',
      data: customer
    })
  } catch (error) {
    console.error('Update customer error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

router.post('/delete/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params
    
    const customer = await db.Customer.findOne({
      where: { id: customerId, status: 1 }
    })
    
    if (!customer) {
      return res.json({ code: 404, message: '客户不存在' })
    }
    
    await customer.update({ status: 0 })
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete customer error:', error)
    res.json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router