"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("order_products", "rating", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("order_products", "review", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("big_order_items", "rating", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("big_order_items", "review", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("order_products", "rating");
    await queryInterface.removeColumn("order_products", "review");
    await queryInterface.removeColumn("big_order_items", "rating");
    await queryInterface.removeColumn("big_order_items", "review");
  },
};
