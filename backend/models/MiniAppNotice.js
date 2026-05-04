module.exports = (sequelize, Sequelize) => {
  const MiniAppNotice = sequelize.define('MiniAppNotice', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    image: {
      type: Sequelize.TEXT,
      defaultValue: ''
    },
    tag: {
      type: Sequelize.STRING(50),
      defaultValue: ''
    },
    tagBg: {
      type: Sequelize.STRING(20),
      defaultValue: '#dcfce7'
    },
    tagColor: {
      type: Sequelize.STRING(20),
      defaultValue: '#16a34a'
    },
    date: {
      type: Sequelize.STRING(20),
      defaultValue: ''
    },
    title: {
      type: Sequelize.STRING(200),
      defaultValue: ''
    },
    desc: {
      type: Sequelize.STRING(500),
      defaultValue: ''
    },
    sort: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'published'
    }
  }, {
    tableName: 'mini_app_notices',
    timestamps: true
  })

  return MiniAppNotice
}
