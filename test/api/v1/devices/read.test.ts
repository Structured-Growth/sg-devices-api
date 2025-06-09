import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/devices/:deviceId", () => {
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
			metadata: {
				a: 1,
				b: 2,
			},
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, 1);
		context["deviceId"] = body.id;
	});

	it("Should read device", async () => {
		const { statusCode, body } = await server.get(`/v1/devices/${context.deviceId}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.deviceId);
		assert.equal(body.orgId, 1);
		assert.equal(body.accountId, 1);
		assert.equal(body.userId, 1);
		assert.equal(body.deviceCategoryId, 1);
		assert.equal(body.deviceTypeId, 1);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.manufacturer, "siemens");
		assert.equal(body.modelNumber, "x201");
		assert.equal(body.serialNumber, "45896572");
		assert.equal(body.imei, "dfrffds12855644");
		assert.equal(body.status, "active");
		assert.equal(body.metadata.a, 1);
		assert.equal(body.metadata.b, 2);
		assert.isString(body.arn);
	});

	it("Should return is device does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/devices/999999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
