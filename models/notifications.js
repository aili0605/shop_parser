'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notifications extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Notifications.belongsTo(models.User,{
        foreignKey: 'userId',
        as: 'user'
      });

      Notifications.belongsTo(model.Product,{
        foreignKey: 'productId',
        as: 'product'
      })
    }
  }
  Notifications.init({
    user_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    message: DataTypes.INTEGER,
    is_sent: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Notifications',
  });
  return Notifications;
};