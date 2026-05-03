require('dotenv').config()
const mysql = require('mysql2/promise')

async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: 'root',
      password: '123456'
    })

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)
    
    await connection.execute(`
      CREATE USER IF NOT EXISTS '${process.env.DB_USER}'@'localhost' 
      IDENTIFIED BY '${process.env.DB_PASSWORD}'
    `)
    
    await connection.execute(`
      GRANT ALL PRIVILEGES ON ${process.env.DB_NAME}.* 
      TO '${process.env.DB_USER}'@'localhost'
    `)
    
    await connection.execute('FLUSH PRIVILEGES')
    
    await connection.end()
    
    console.log('数据库初始化完成')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  }
}

initDatabase()