import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("PUT /api/v1/devices/:deviceId", () => {
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

	it("Should update device", async () => {
		const { statusCode, body } = await server.put(`/v1/devices/${context.deviceId}`).send({
			accountId: 2,
			userId: 2,
			deviceCategoryId: 2,
			deviceTypeId: 2,
			manufacturer: "xiomi",
			modelNumber: "y201",
			serialNumber: "45886572",
			imei: "dfrdfdf12855644",
			status: "inactive",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.deviceId);
		assert.equal(body.accountId, 2);
		assert.equal(body.userId, 2);
		assert.equal(body.deviceCategoryId, 2);
		assert.equal(body.deviceTypeId, 2);
		assert.equal(body.manufacturer, "xiomi");
		assert.equal(body.modelNumber, "y201");
		assert.equal(body.serialNumber, "45886572");
		assert.equal(body.imei, "dfrdfdf12855644");
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/devices/${context.userId}`).send({
			accountId: "acc",
			userId: "user",
			deviceCategoryId: -2,
			deviceTypeId: -2,
			manufacturer: 1,
			modelNumber: 2,
			serialNumber: 3,
			imei: 4,
			status: "inactivetoday",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.userId[0]);
		assert.isString(body.validation.body.deviceCategoryId[0]);
		assert.isString(body.validation.body.deviceTypeId[0]);
		assert.isString(body.validation.body.manufacturer[0]);
		assert.isString(body.validation.body.modelNumber[0]);
		assert.isString(body.validation.body.serialNumber[0]);
		assert.isString(body.validation.body.imei[0]);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error if device id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/devices/9999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if device id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/devices/stringid`).send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
