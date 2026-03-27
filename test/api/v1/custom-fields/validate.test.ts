import "../../../../src/app/providers";
import { assert } from "chai";
import { joi, RegionEnum } from "@structured-growth/microservice-sdk";
import { initTest } from "../../../common/init-test";
import CustomField from "../../../../database/models/custom-field";

describe("POST /api/v1/custom-fields/validate", () => {
	const { server } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	it("Should return successful validation result", async () => {
		await CustomField.create({
			orgId,
			region: RegionEnum.US,
			entity: "Device",
			title: "Calibration code",
			name: "calCode",
			schema: joi.string().min(2).describe(),
			status: "active",
		});

		const { statusCode, body } = await server.post("/v1/custom-fields/validate").send({
			entity: "Device",
			orgId,
			data: {
				calCode: "AB",
			},
		});

		assert.equal(statusCode, 200);
		assert.equal(body.valid, true);
		assert.isUndefined(body.message);
		assert.isUndefined(body.errors);
	});

	it("Should return validation result with errors", async () => {
		await CustomField.create({
			orgId,
			region: RegionEnum.US,
			entity: "Device",
			title: "Calibration code",
			name: "calCode",
			schema: joi.string().min(2).describe(),
			status: "active",
		});

		const { statusCode, body } = await server.post("/v1/custom-fields/validate").send({
			entity: "Device",
			orgId,
			data: {
				calCode: "A",
			},
		});

		assert.equal(statusCode, 200);
		assert.equal(body.valid, false);
		assert.isString(body.message);
		assert.isString(body.errors.calCode[0]);
	});

	it("Should return request validation error", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields/validate").send({
			entity: 1,
			orgId: "wrong",
			data: "wrong",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.entity[0]);
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.data[0]);
	});
});
