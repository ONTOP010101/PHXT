module.exports = (sequelize, Sequelize) => {
  const MiniAppBanner = sequelize.define('MiniAppBanner', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tag: {
      type: Sequelize.STRING(50),
      defaultValue: 'NOTICE'
    },
    title: {
      type: Sequelize.STRING(200),
      defaultValue: '2024广州玩具展览会\n厂商专属排号服务'
    },
    desc: {
      type: Sequelize.STRING(200),
      defaultValue: '实时叫号 · 无需等候 · 高效洽谈'
    },
    btnText: {
      type: Sequelize.STRING(50),
      defaultValue: '立即查号'
    }
  }, {
    tableName: 'mini_app_banners',
    timestamps: true
  })

  return MiniAppBanner
}
