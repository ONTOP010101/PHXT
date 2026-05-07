const { Sequelize } = require('sequelize')
const config = require('../config/database')

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    timezone: config.timezone,
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    }
  }
)

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

db.User = require('./User')(sequelize, Sequelize)
db.Role = require('./Role')(sequelize, Sequelize)
db.Customer = require('./Customer')(sequelize, Sequelize)
db.Company = require('./Company')(sequelize, Sequelize)
db.MeetingRoom = require('./MeetingRoom')(sequelize, Sequelize)
db.Queue = require('./Queue')(sequelize, Sequelize)
db.Token = require('./Token')(sequelize, Sequelize)
db.DisplaySetting = require('./DisplaySetting')(sequelize, Sequelize)
db.MiniAppBanner = require('./MiniAppBanner')(sequelize, Sequelize)
db.MiniAppNotice = require('./MiniAppNotice')(sequelize, Sequelize)
db.SystemLog = require('./SystemLog')(sequelize, Sequelize)

db.Queue.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' })
db.Queue.belongsTo(db.Company, { foreignKey: 'companyId', as: 'company' })
db.Queue.belongsTo(db.MeetingRoom, { foreignKey: 'roomId', as: 'meetingRoom' })
db.User.hasMany(db.Token, { foreignKey: 'userId', as: 'tokens' })

module.exports = db
