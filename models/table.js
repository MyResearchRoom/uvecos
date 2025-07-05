"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Table belongs to Section
      Table.belongsTo(models.Section, {
        foreignKey: "sectionId",
        as: "section",
      });
    }
  }

  Table.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      informationTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      information: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Table",
      tableName: "tables",
      timestamps: false, // No createdAt and updatedAt fields
    }
  );

  return Table;
};
