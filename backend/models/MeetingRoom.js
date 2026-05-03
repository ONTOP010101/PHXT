module.exports = (sequelize, Sequelize) => {
  const MeetingRoom = sequelize.define('MeetingRoom', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    type: {
      type: Sequelize.STRING(20),
      defaultValue: 'private'
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'free'
    },
    companyName: {
      type: Sequelize.STRING(100)
    },
    visitRequirement: {
      type: Sequelize.TEXT
    },
    quotePoints: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    currentNumber: {
      type: Sequelize.STRING(20)
    },
    nextNumber: {
      type: Sequelize.STRING(20)
    },
    waitingTime: {
      type: Sequelize.INTEGER,
      defaultValue: 0
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
    tableName: 'meeting_rooms',
    timestamps: true
  })

  return MeetingRoom
}