module.exports = (sequelize, Sequelize) => {
  const Token = sequelize.define('Token', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    token: {
      type: Sequelize.STRING(500),
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: 'tokens',
    timestamps: true
  })

  return Token
}