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
      Product.belongsTo(models.Brand, { 
        foreignKey: 'brand_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
      });
      Product.belongsTo(models.Category, { 
        foreignKey: 'category_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Product.hasMany(models.Wishlist, {
        foreignKey: 'product_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
      Product.hasMany(models.ProductAttribute,{ 
        foreignKey: 'product_id', 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
      Product.hasMany(models.Notification, { 
        foreignKey: 'product_id', 
        onDelete: 'CASCADE' ,
        onUpdate: 'CASCADE'
    });
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category_id:{ 
      type:DataTypes.INTEGER,
      allowNull: true
    },
    price: DataTypes.DECIMAL,
    currency: DataTypes.STRING,
    url: DataTypes.STRING,
    image_url: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};