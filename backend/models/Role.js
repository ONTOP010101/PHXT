module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.STRING(200),
      allowNull: true
    },
    permissions: {
      type: Sequelize.TEXT,
      allowNull: false,
      get() {
        const permissions = this.getDataValue('permissions')
        try {
          return JSON.parse(permissions)
        } catch {
          return {}
        }
      },
      set(value) {
        this.setDataValue('permissions', JSON.stringify(value))
      }
    },
    status: {
      type: Sequelize.TINYINT,
      defaultValue: 1,
      comment: '0: disabled, 1: enabled'
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
    tableName: 'roles',
    timestamps: true
  })

  return Role
}