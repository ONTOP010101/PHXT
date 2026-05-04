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

    console.log('开始给 companies 表添加 wxid 字段...')

    const [rows] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'companies' AND COLUMN_NAME = 'wxid'
    `, [process.env.DB_NAME])

    if (rows.length === 0) {
      await connection.execute(`
        ALTER TABLE companies 
        ADD COLUMN wxid VARCHAR(100) DEFAULT '' AFTER phone
      `)
      console.log('✅ wxid 字段添加成功！')
    } else {
      console.log('ℹ️ wxid 字段已存在，跳过')
    }

    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ 修改表结构失败:', error)
    process.exit(1)
  }
}

updateTable()
