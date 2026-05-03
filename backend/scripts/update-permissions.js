require('dotenv').config()
const db = require('../models')

async function updatePermissions() {
  try {
    const superAdminRole = await db.Role.findByPk(1)
    if (superAdminRole) {
      const permissions = {
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
      }
      await superAdminRole.update({ permissions })
      console.log('超级管理员权限更新完成')
    }

    const adminRole = await db.Role.findByPk(2)
    if (adminRole) {
      const permissions = {
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
      }
      await adminRole.update({ permissions })
      console.log('管理员权限更新完成')
    }

    const salesmanRole = await db.Role.findByPk(3)
    if (salesmanRole) {
      const permissions = {
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
      }
      await salesmanRole.update({ permissions })
      console.log('业务员权限更新完成')
    }

    const guestRole = await db.Role.findByPk(4)
    if (guestRole) {
      const permissions = {
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
      }
      await guestRole.update({ permissions })
      console.log('只读访客权限更新完成')
    }

    process.exit(0)
  } catch (error) {
    console.error('更新权限失败:', error)
    process.exit(1)
  }
}

updatePermissions()