import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/devices", () => {
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
		context["deviceId"] = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/devices").query({
			orgId: "a",
			accountId: 0,
			userId: 0,
			deviceCategoryId: -5,
			deviceTypeId: -7,
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			manufacturer: "SuperLongManufacturerNameThatExceedsTheLimitOfFiftyCharacters",
			modelNumber: "ExtraordinarilyLongModelNumberThatSurpassesFiftyCharacters",
			serialNumber:
				"ThisIsAnExtremelyLongSerialNumberThatDefinitelyExceedsTheLimitOfOneHundredCharactersAndKeepsGoingAndGoing",
			imei: "123456789012345678901234567890123456789012345678901",
			"status[0]": "superuser",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.userId[0]);
		assert.isString(body.validation.query.deviceCategoryId[0]);
		assert.isString(body.validation.query.deviceTypeId[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.manufacturer[0]);
		assert.isString(body.validation.query.modelNumber[0]);
		assert.isString(body.validation.query.serialNumber[0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.imei[0][0]);
	});

	it("Should return device", async () => {
		const { statusCode, body } = await server.get("/v1/devices").query({
			"id[0]": context.deviceId,
			orgId: 1,
			accountId: 1,
			userId: 1,
			deviceCategoryId: 1,
			"deviceTypeId[0]": 1,
			manufacturer: "siemens",
			modelNumber: "x201",
			serialNumber: "45896572",
			imei: "dfrffds12855644",
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.deviceId);
		assert.equal(body.data[0].orgId, 1);
		assert.equal(body.data[0].accountId, 1);
		assert.equal(body.data[0].userId, 1);
		assert.equal(body.data[0].deviceCategoryId, 1);
		assert.equal(body.data[0].deviceTypeId, 1);
		assert.equal(body.data[0].manufacturer, "siemens");
		assert.equal(body.data[0].modelNumber, "x201");
		assert.equal(body.data[0].serialNumber, "45896572");
		assert.equal(body.data[0].imei, "dfrffds12855644");
		assert.equal(body.data[0].status, "active");
		assert.equal(body.data[0].metadata.a, 1);
		assert.equal(body.data[0].metadata.b, 2);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});
});
