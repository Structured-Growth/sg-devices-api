import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/devices/get-product-sn", () => {
	const { server } = initTest();

	it("Should return validation error (serialNumber is required array)", async () => {
		const r1 = await server.get("/v1/devices/get-product-sn");
		assert.equal(r1.statusCode, 422);
		assert.equal(r1.body.name, "ValidationError");
		assert.isDefined(r1.body.validation);
		assert.isString(r1.body.validation.query.serialNumber[0]);

		const r2 = await server.get("/v1/devices/get-product-sn").query({
			serialNumber: 123,
		});
		assert.equal(r2.statusCode, 422);
		assert.equal(r2.body.name, "ValidationError");
		assert.isString(r2.body.validation.query.serialNumber[0]);
	});

	it("Should return serialNumber -> productSerialNumber mapping", async () => {
		const d1 = await server.post("/v1/devices").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			userId: 1,
			deviceCategoryId: 1,
			deviceTypeId: 1,
			manufacturer: "siemens",
			modelNumber: "x201",
			serialNumber: "IEEE-OK-1",
			imei: "imei-1",
			status: "active",
			metadata: {
				productSerialNumber: "PSN-111",
			},
		});
		assert.equal(d1.statusCode, 201);

		const d2 = await server.post("/v1/devices").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			userId: 1,
			deviceCategoryId: 1,
			deviceTypeId: 1,
			manufacturer: "siemens",
			modelNumber: "x201",
			serialNumber: "IEEE-NO-PSN",
			imei: "imei-2",
			status: "active",
			metadata: {
				a: 1,
			},
		});
		assert.equal(d2.statusCode, 201);

		const { statusCode, body } = await server.get("/v1/devices/get-product-sn").query({
			"serialNumber[0]": "IEEE-OK-1",
			"serialNumber[1]": "IEEE-NO-PSN",
			"serialNumber[2]": "IEEE-NOT-EXISTS",
		});

		assert.equal(statusCode, 200);
		assert.isArray(body);

		assert.equal(body.length, 1);
		assert.isObject(body[0]);
		assert.equal(body[0]["IEEE-OK-1"], "PSN-111");
	});

	it("Should return empty array when nothing found / no productSerialNumber", async () => {
		const d = await server.post("/v1/devices").send({
			orgId: 1,
			region: "us",
			accountId: 1,
			userId: 1,
			deviceCategoryId: 1,
			deviceTypeId: 1,
			manufacturer: "siemens",
			modelNumber: "x201",
			serialNumber: "IEEE-ONLY-NO-PSN",
			imei: "imei-3",
			status: "active",
			metadata: {
				foo: "bar",
			},
		});
		assert.equal(d.statusCode, 201);

		const { statusCode, body } = await server.get("/v1/devices/get-product-sn").query({
			"serialNumber[0]": "IEEE-ONLY-NO-PSN",
			"serialNumber[1]": "IEEE-ABSENT-999",
		});

		assert.equal(statusCode, 200);
		assert.isArray(body);
		assert.equal(body.length, 0);
	});
});
