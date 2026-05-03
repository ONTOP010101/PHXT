module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define('Customer', {
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
    contactPerson: {
      type: Sequelize.STRING(50)
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
    tableName: 'customers',
    timestamps: true
  })

  return Customer
}