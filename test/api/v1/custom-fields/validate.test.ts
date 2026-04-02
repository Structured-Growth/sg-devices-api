import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/custom-fields/validate", () => {
	const { server } = initTest();
	let orgId: number;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
		await seedCustomFields(orgId);
	});

	it("Should return successful validation result", async () => {
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
		const { statusCode, body } = await server.post("/v1/custom-fields/validate").send({
			entity: "Device",
			orgId,
			data: {
				calCode: {
					invalid: true,
				},
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
