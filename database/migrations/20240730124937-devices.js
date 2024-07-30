"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable("devices", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			org_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			region: {
				type: Sequelize.STRING(10),
				allowNull: false,
			},
			account_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			device_category_id: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			device_type_id: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			manufacturer: Sequelize.STRING(50),
			model_number: Sequelize.STRING(50),
			serial_number: Sequelize.STRING(100),
			imei: Sequelize.STRING(50),
			status: {
				type: Sequelize.STRING(10),
				allowNull: false,
			},
			created_at: Sequelize.DATE,
			updated_at: Sequelize.DATE,
			deleted_at: Sequelize.DATE,
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("devices");
	},
};
