import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("POST /api/v1/devices/bulk", () => {
	const { server } = initTest();

	it("Should bulk create devices", async () => {
		const { statusCode, body } = await server.post("/v1/devices/bulk").send([
			{
				orgId: 1,
				region: "us",
				accountId: 1,
				userId: 1,
				deviceCategoryId: 1,
				deviceTypeId: 1,
				manufacturer: "siemens",
				modelNumber: "x201",
				serialNumber: "abc123456",
				imei: "imei123456",
				status: "active",
			},
			{
				orgId: 1,
				region: "us",
				accountId: 2,
				userId: 2,
				deviceCategoryId: 2,
				deviceTypeId: 2,
				manufacturer: "bosch",
				modelNumber: "y700",
				serialNumber: "abc654321",
				imei: "imei654321",
				status: "inactive",
			},
		]);

		assert.equal(statusCode, 201);
		assert.isArray(body);
		assert.lengthOf(body, 2);

		for (const device of body) {
			assert.isNumber(device.id);
			assert.isString(device.arn);
			assert.equal(device.orgId, 1);
			assert.include("us", device.region);
			assert.include(["active", "inactive"], device.status);
		}
	}).timeout(1800000);

	it("Should return validation error on invalid bulk payload", async () => {
		const { statusCode, body } = await server.post("/v1/devices/bulk").send([
			{
				orgId: "wrong",
				region: "x",
				accountId: "text",
				userId: -1,
				deviceCategoryId: 0,
				deviceTypeId: -2,
				manufacturer: 99,
				modelNumber: true,
				serialNumber: 123,
				imei: 456,
				status: "broken",
			},
		]);

		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body[0].orgId[0]);
		assert.isString(body.validation.body[0].region[0]);
		assert.isString(body.validation.body[0].accountId[0]);
		assert.isString(body.validation.body[0].userId[0]);
		assert.isString(body.validation.body[0].deviceCategoryId[0]);
		assert.isString(body.validation.body[0].deviceTypeId[0]);
		assert.isString(body.validation.body[0].manufacturer[0]);
		assert.isString(body.validation.body[0].modelNumber[0]);
		assert.isString(body.validation.body[0].serialNumber[0]);
		assert.isString(body.validation.body[0].imei[0]);
		assert.isString(body.validation.body[0].status[0]);
	}).timeout(1800000);
});
