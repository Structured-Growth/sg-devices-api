"use strict";

const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "devices",
			},
			"metadata",
			Sequelize.JSONB
		);
	},

	async down(queryInterface) {
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "devices",
			},
			"metadata"
		);
	},
};
