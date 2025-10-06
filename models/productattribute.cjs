'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductAttribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductAttribute.belongsTo(models.Product,{
        foreignKey: 'product_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    };
  }
  ProductAttribute.init({
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    attribute_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attribute_value: { 
      type:DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'ProductAttribute',
  });
  return ProductAttribute;
};