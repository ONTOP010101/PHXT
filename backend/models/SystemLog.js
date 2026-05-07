module.exports = (sequelize, Sequelize) => {
  const SystemLog = sequelize.define('SystemLog', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    module: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    action: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    operator: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    operatorName: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    targetId: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    detail: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    ip: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    status: {
      type: Sequelize.TINYINT,
      defaultValue: 1,
      comment: '0: failed, 1: success'
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: 'system_logs',
    timestamps: true,
    updatedAt: false
  })

  return SystemLog
}
