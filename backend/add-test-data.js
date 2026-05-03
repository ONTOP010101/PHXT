require('dotenv').config()
const db = require('./models')

async function addTestData() {
  try {
    console.log('添加测试数据...')
    
    // 添加测试客户
    const customers = [
      { companyName: '测试客户A', phone: '13800138001' },
      { companyName: '测试客户B', phone: '13800138002' },
      { companyName: '测试客户C', phone: '13800138003' }
    ]
    
    for (const customer of customers) {
      const exists = await db.Customer.findOne({ where: { phone: customer.phone } })
      if (!exists) {
        await db.Customer.create(customer)
        console.log(`添加客户: ${customer.companyName}`)
      }
    }
    
    // 添加测试厂商
    const companies = [
      { companyName: '厂商A', phone: '13900139001' },
      { companyName: '厂商B', phone: '13900139002' },
      { companyName: '厂商C', phone: '13900139003' },
      { companyName: '厂商D', phone: '13900139004' },
      { companyName: '厂商E', phone: '13900139005' }
    ]
    
    for (const company of companies) {
      const exists = await db.Company.findOne({ where: { phone: company.phone } })
      if (!exists) {
        await db.Company.create(company)
        console.log(`添加厂商: ${company.companyName}`)
      }
    }
    
    // 添加测试洽谈室
    const rooms = [
      { name: '1号洽谈室', status: 'free' },
      { name: '2号洽谈室', status: 'free' },
      { name: '3号洽谈室', status: 'free' }
    ]
    
    for (const room of rooms) {
      const exists = await db.MeetingRoom.findOne({ where: { name: room.name } })
      if (!exists) {
        await db.MeetingRoom.create(room)
        console.log(`添加洽谈室: ${room.name}`)
      }
    }
    
    console.log('\n测试数据添加完成！')
    process.exit(0)
  } catch (error) {
    console.error('添加测试数据失败:', error)
    process.exit(1)
  }
}

addTestData()