module.exports = (sequelize, Sequelize) => {
  const DisplaySetting = sequelize.define('DisplaySetting', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    screenTitle: {
      type: Sequelize.STRING(100),
      defaultValue: '排号管理系统'
    },
    cardColor: {
      type: Sequelize.STRING(20),
      defaultValue: '#6ba6d6'
    },
    refreshInterval: {
      type: Sequelize.STRING(10),
      defaultValue: '10'
    },
    displayCount: {
      type: Sequelize.INTEGER,
      defaultValue: 10
    },
    voiceType: {
      type: Sequelize.STRING(10),
      defaultValue: 'female'
    },
    speechRate: {
      type: Sequelize.STRING(10),
      defaultValue: '0.8'
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'on'
    }
  }, {
    tableName: 'display_settings',
    timestamps: true
  })

  return DisplaySetting
}