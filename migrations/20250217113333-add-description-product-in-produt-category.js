"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("product_categories", "description", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("main_categories", "description", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("product_categories", "description");
    await queryInterface.removeColumn("main_categories", "description");
  },
};
