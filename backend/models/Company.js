module.exports = (sequelize, Sequelize) => {
  const Company = sequelize.define('Company', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    companyName: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: false
    },
    wxid: {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: ''
    },
    itemNumber: {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: ''
    },
    status: {
      type: Sequelize.TINYINT,
      defaultValue: 1
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: 'companies',
    timestamps: true
  })

  return Company
}