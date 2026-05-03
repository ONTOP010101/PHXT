require('dotenv').config()

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'queue_management',
  username: process.env.DB_USER || 'queue_user',
  password: process.env.DB_PASSWORD || 'queue_password_123',
  dialect: 'mysql',
  timezone: '+08:00',
  dialectOptions: {
    charset: 'utf8mb4',
    connectTimeout: 60000,
    supportBigNumbers: true,
    bigNumberStrings: true
  }
}