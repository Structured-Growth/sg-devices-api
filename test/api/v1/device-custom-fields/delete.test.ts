import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("DELETE /api/v1/device-custom-fields/:deviceCustomFieldId", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	it("Should create device custom field", async () => {
		const { statusCode, body } = await server.post("/v1/device-custom-fields").send({
			orgId,
			region: "us",
			entity: "Device",
			title: "Calibration code",
			name: "calCode",
			schema: {
				type: "string",
			},
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["deviceCustomFieldId"] = body.id;
	});

	it("Should delete device custom field", async () => {
		const { statusCode } = await server.delete(`/v1/device-custom-fields/${context.deviceCustomFieldId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return if device custom field does not exist", async () => {
		const { statusCode, body } = await server.delete("/v1/device-custom-fields/99999999");
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete("/v1/device-custom-fields/wrong");
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.deviceCustomFieldId[0]);
	});
});
