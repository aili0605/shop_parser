'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Notification.belongsTo(models.Product,{
        foreignKey: 'product_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    };
  }
  
  Notification.init({
    user_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read:{
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
  });

  return Notification;
};