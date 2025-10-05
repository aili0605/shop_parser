'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Price_history extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Price_history.belongsTo(models.Product,{
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  Price_history.init({
    product_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    price: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Price_history',
  });
  return Price_history;
};