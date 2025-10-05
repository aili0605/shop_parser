'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shared_wishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Shared_wishlist.belongsTo(models.Wishlist,{
        foreignKey: 'wishlistId',
        as: 'wishlist'
      });
    }
  }
  Shared_wishlist.init({
    wishlist_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    share_token: {
      type: DataTypes.STRING,
      allowNull: false
    }
 }, {
    sequelize,
    modelName: 'Shared_wishlist',
  });
  return Shared_wishlist;
};