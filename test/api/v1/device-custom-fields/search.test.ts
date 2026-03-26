import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/device-custom-fields", () => {
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

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/device-custom-fields").query({
			orgId: "a",
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			"entity[0]": "VeryLongEntityName".repeat(30),
			"status[0]": "superactive",
			"title[0]": "VeryLongTitle".repeat(30),
			"name[0]": "VeryLongName".repeat(30),
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.entity[0][0]);
		assert.isString(body.validation.query.status[0][0]);
		assert.isString(body.validation.query.title[0][0]);
		assert.isString(body.validation.query.name[0][0]);
	});

	it("Should return device custom field", async () => {
		const { statusCode, body } = await server.get("/v1/device-custom-fields").query({
			"id[0]": context.deviceCustomFieldId,
			orgId,
			"entity[0]": "Device",
			"status[0]": "active",
			"title[0]": "Calibration*",
			"name[0]": "calCode",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.deviceCustomFieldId);
		assert.equal(body.data[0].orgId, orgId);
		assert.equal(body.data[0].region, "us");
		assert.equal(body.data[0].entity, "Device");
		assert.equal(body.data[0].title, "Calibration code");
		assert.equal(body.data[0].name, "calCode");
		assert.equal(body.data[0].schema.type, "string");
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
		assert.equal(body.total, 1);
	});
});
