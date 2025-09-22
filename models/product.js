'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    Product.belongsTo(models.Category,{
      foreignKey: 'categoryId',
      as: 'category'
    });

    Product.belongsTo(models.Seller,{
      foreignKey: 'sellerId',
      as: 'seller'
    });
    Product.hasMany(models.Wishlist, {
      foreignKey: 'productId',
      as: 'wishlists'
    });

    Product.hasMany(models.Notification, {
      foreignKey: 'productId',
      as: 'notifications'
    });
  }
}
  Product.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    categoryId: DataTypes.INTEGER,
    sellerId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};