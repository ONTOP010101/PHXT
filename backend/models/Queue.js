module.exports = (sequelize, Sequelize) => {
  const Queue = sequelize.define('Queue', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: Sequelize.INTEGER
    },
    companyId: {
      type: Sequelize.INTEGER
    },
    roomId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    queueNumber: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'waiting'
    },
    completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    calledAt: {
      type: Sequelize.DATE
    },
    completedAt: {
      type: Sequelize.DATE
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
    tableName: 'queues',
    timestamps: true
  })

  return Queue
}