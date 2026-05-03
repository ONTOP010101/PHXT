const db = require('../models')

const initDisplaySettings = async () => {
  try {
    await db.sequelize.sync({ force: false })
    console.log('Database synchronized')

    let settings = await db.DisplaySetting.findOne()
    if (!settings) {
      settings = await db.DisplaySetting.create({
        screenTitle: '排号管理系统',
        cardColor: '#6ba6d6',
        refreshInterval: '10',
        displayCount: 10,
        voiceType: 'female',
        speechRate: '0.8',
        status: 'on'
      })
      console.log('Display settings created:', settings.toJSON())
    } else {
      console.log('Display settings already exists:', settings.toJSON())
    }

    process.exit(0)
  } catch (error) {
    console.error('Init error:', error)
    process.exit(1)
  }
}

initDisplaySettings()