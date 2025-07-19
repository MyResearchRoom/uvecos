"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("companies", "logo", {
      type: Sequelize.BLOB("long"),
      allowNull: false,
    });
    await queryInterface.addColumn("companies", "contentType", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn("companies", "licenseDocument");
    await queryInterface.removeColumn("companies", "governmentIssuedId");
    await queryInterface.removeColumn("companies", "proofOfBusinessAuthority");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("companies", "logo");
    await queryInterface.removeColumn("companies", "contentType");
  },
};
