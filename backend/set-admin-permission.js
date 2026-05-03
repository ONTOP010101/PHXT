require('dotenv').config()
const db = require('./models')

async function setAdminPermission() {
  try {
    const admin = await db.User.findOne({ where: { username: 'admin' } })
    if (!admin) {
      console.log('管理员账号不存在')
      process.exit(1)
    }

    let superAdminRole = await db.Role.findOne({ where: { name: '超级管理员' } })
    if (!superAdminRole) {
      superAdminRole = await db.Role.create({
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
      console.log('已创建超级管理员角色')
    }

    await admin.update({ role: 'admin' })
    console.log('管理员账号已配置超级管理员权限')
    
    process.exit(0)
  } catch (error) {
    console.error('设置权限失败:', error)
    process.exit(1)
  }
}

setAdminPermission()