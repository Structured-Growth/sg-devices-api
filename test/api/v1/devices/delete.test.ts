import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("DELETE /api/v1/devices/:deviceId", function () {
	this.timeout(20000);
	const { server, context } = initTest();

	it("Should create device", async () => {
		const { statusCode, body } = await server.post("/v1/devices").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			userId: 1,
			deviceCategoryId: 1,
			deviceTypeId: 1,
			manufacturer: "siemens",
			modelNumber: "x201",
			serialNumber: "45896572",
			imei: "dfrffds12855644",
			status: "active",
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["deviceId"] = body.id;
	});

	it("Should delete device", async () => {
		const { statusCode, body } = await server.delete(`/v1/devices/${context.deviceId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return if device does not exist", async () => {
		const { statusCode, body } = await server.delete(`/v1/devices/255`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/devices/wrong`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.deviceId[0]);
	});
});
