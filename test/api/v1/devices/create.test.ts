import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/devices", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	beforeEach(() => {
		return seedCustomFields(orgId);
	});

	it("Should create device", async () => {
		const { statusCode, body } = await server.post("/v1/devices").send({
			orgId,
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
		assert.equal(body.orgId, orgId);
		assert.equal(body.accountId, 1);
		assert.equal(body.userId, 1);
		assert.equal(body.deviceCategoryId, 1);
		assert.equal(body.deviceTypeId, 1);
		assert.equal(body.manufacturer, "siemens");
		assert.equal(body.modelNumber, "x201");
		assert.equal(body.serialNumber, "45896572");
		assert.equal(body.imei, "dfrffds12855644");
		assert.equal(body.status, "active");
		assert.equal(body.metadata.a, 1);
		assert.equal(body.metadata.b, 2);
		assert.isString(body.arn);
		context["deviceId"] = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/devices").send({
			orgId: "org",
			region: "u",
			accountId: "acc",
			userId: "user",
			deviceCategoryId: "cat",
			deviceTypeId: -1,
			manufacturer: 21,
			modelNumber: 78,
			serialNumber: 45896572,
			imei: 12855644,
			status: "veryactive",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
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

	it("Should return validation error for invalid custom fields", async () => {
		const { statusCode, body } = await server.post("/v1/devices").send({
			orgId,
			region: "us",
			deviceCategoryId: 1,
			deviceTypeId: 1,
			status: "active",
			metadata: {
				calCode: 123,
			},
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.calCode[0]);
	});
});
