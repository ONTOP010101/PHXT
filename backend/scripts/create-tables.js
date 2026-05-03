require('dotenv').config()
const db = require('../models')

async function createTables() {
  try {
    await db.sequelize.sync({ force: false })
    console.log('表结构创建完成')
    
    const adminExists = await db.User.findOne({ where: { username: 'admin' } })
    if (!adminExists) {
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('123456', 10)
      await db.User.create({
        username: 'admin',
        password: hashedPassword,
        name: '管理员',
        role: 'admin'
      })
      console.log('默认管理员账号创建完成: admin / 123456')
    }
    
    const superAdminRole = await db.Role.findOne({ where: { name: '超级管理员' } })
    if (!superAdminRole) {
      await db.Role.create({
        name: '超级管理员',
        description: '拥有系统全部权限',
        permissions: JSON.stringify({
          home: { enable: true, view: true, export: true },
          customer: { enable: true, view: true, add: true, edit: true, delete: true },
          meeting: { enable: true, view: true, add: true, edit: true, delete: true, close: true, pause: true },
          publicBusiness: { enable: true, view: true, call: true, register: true, cancel: true },
          appointBusiness: { enable: true, view: true, add: true, call: true, complete: true },
          selfQueue: { enable: true, view: true, queue: true, dispatch: true },
          display: { enable: true, view: true, config: true, control: true },
          miniApp: { enable: true, view: true, config: true },
          role: { enable: true, view: true, add: true, edit: true, delete: true, permission: true },
          user: { enable: true, view: true, add: true, edit: true, delete: true, resetPwd: true }
        })
      })
      console.log('超级管理员角色创建完成')
    }
    
    const adminRole = await db.Role.findOne({ where: { name: '管理员' } })
    if (!adminRole) {
      await db.Role.create({
        name: '管理员',
        description: '拥有管理权限',
        permissions: JSON.stringify({
          home: { enable: true, view: true, export: true },
          customer: { enable: true, view: true, add: true, edit: true, delete: true },
          meeting: { enable: true, view: true, add: true, edit: true, delete: true, close: true, pause: true },
          publicBusiness: { enable: true, view: true, call: true, register: true, cancel: true },
          appointBusiness: { enable: true, view: true, add: true, call: true, complete: true },
          selfQueue: { enable: true, view: true, queue: true, dispatch: true },
          display: { enable: true, view: true, config: true, control: true },
          miniApp: { enable: true, view: true, config: true },
          role: { enable: true, view: true, add: true, edit: true, delete: true, permission: false },
          user: { enable: true, view: true, add: true, edit: true, delete: true, resetPwd: true }
        })
      })
      console.log('管理员角色创建完成')
    }
    
    const salesmanRole = await db.Role.findOne({ where: { name: '业务员' } })
    if (!salesmanRole) {
      await db.Role.create({
        name: '业务员',
        description: '拥有部分业务权限',
        permissions: JSON.stringify({
          home: { enable: true, view: true, export: false },
          customer: { enable: true, view: true, add: true, edit: true, delete: false },
          meeting: { enable: true, view: true, add: false, edit: false, delete: false, close: true, pause: true },
          publicBusiness: { enable: true, view: true, call: true, register: true, cancel: true },
          appointBusiness: { enable: true, view: true, add: true, call: true, complete: true },
          selfQueue: { enable: true, view: true, queue: true, dispatch: false },
          display: { enable: true, view: true, config: false, control: true },
          miniApp: { enable: false, view: false, config: false },
          role: { enable: false, view: false, add: false, edit: false, delete: false, permission: false },
          user: { enable: false, view: false, add: false, edit: false, delete: false, resetPwd: false }
        })
      })
      console.log('业务员角色创建完成')
    }
    
    const guestRole = await db.Role.findOne({ where: { name: '只读访客' } })
    if (!guestRole) {
      await db.Role.create({
        name: '只读访客',
        description: '仅拥有只读权限',
        permissions: JSON.stringify({
          home: { enable: true, view: true, export: false },
          customer: { enable: true, view: true, add: false, edit: false, delete: false },
          meeting: { enable: true, view: true, add: false, edit: false, delete: false, close: false, pause: false },
          publicBusiness: { enable: true, view: true, call: false, register: false, cancel: false },
          appointBusiness: { enable: true, view: true, add: false, call: false, complete: false },
          selfQueue: { enable: true, view: true, queue: false, dispatch: false },
          display: { enable: true, view: true, config: false, control: false },
          miniApp: { enable: false, view: false, config: false },
          role: { enable: false, view: false, add: false, edit: false, delete: false, permission: false },
          user: { enable: false, view: false, add: false, edit: false, delete: false, resetPwd: false }
        })
      })
      console.log('只读访客角色创建完成')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('创建表结构失败:', error)
    process.exit(1)
  }
}

createTables()