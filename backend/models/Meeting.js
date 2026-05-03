module.exports = (sequelize, DataTypes) => {
  const Meeting = sequelize.define('Meeting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '洽谈室名称'
    },
    type: {
      type: DataTypes.ENUM('public', 'private'),
      defaultValue: 'public',
      comment: '类型: public-公开见客, private-专点见客'
    },
    status: {
      type: DataTypes.ENUM('free', 'occupied', 'disabled'),
      defaultValue: 'free',
      comment: '状态: free-空闲, occupied-启用, disabled-暂停'
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '公司名称'
    },
    visitRequirement: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '见客要求'
    }
  }, {
    tableName: 'meetings',
    timestamps: true,
    comment: '洽谈室表'
  })

  return Meeting
}