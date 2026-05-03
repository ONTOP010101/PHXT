require('dotenv').config()
const db = require('./models')

async function resetAdminPassword() {
  try {
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const admin = await db.User.findOne({ where: { username: 'admin' } })
    if (admin) {
      await admin.update({ password: hashedPassword })
      console.log('管理员密码已重置为: admin / 123456')
    } else {
      await db.User.create({
        username: 'admin',
        password: hashedPassword,
        name: '管理员',
        role: 'admin'
      })
      console.log('管理员账号已创建: admin / 123456')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('重置密码失败:', error)
    process.exit(1)
  }
}

resetAdminPassword()