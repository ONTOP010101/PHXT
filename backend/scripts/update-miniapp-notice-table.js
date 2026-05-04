require('dotenv').config()
const mysql = require('mysql2/promise')

async function updateTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    console.log('开始修改 mini_app_notices 表结构...')

    // 修改 image 字段为 TEXT 类型
    await connection.execute(`
      ALTER TABLE mini_app_notices 
      MODIFY COLUMN image TEXT 
    `)

    console.log('✅ mini_app_notices 表结构修改成功！')
    console.log('image 字段现在支持更长的文本了')

    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ 修改表结构失败:', error)
    process.exit(1)
  }
}

updateTable()
