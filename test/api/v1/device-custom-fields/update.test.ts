import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("PUT /api/v1/device-custom-fields/:deviceCustomFieldId", () => {
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

	it("Should update device custom field", async () => {
		const { statusCode, body } = await server.put(`/v1/device-custom-fields/${context.deviceCustomFieldId}`).send({
			entity: "Device",
			title: "Expiration date",
			name: "endOfLifeDatetime",
			schema: {
				type: "string",
				format: "date-time",
			},
			status: "inactive",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.deviceCustomFieldId);
		assert.equal(body.entity, "Device");
		assert.equal(body.title, "Expiration date");
		assert.equal(body.name, "endOfLifeDatetime");
		assert.equal(body.schema.type, "string");
		assert.equal(body.schema.format, "date-time");
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/device-custom-fields/${context.deviceCustomFieldId}`).send({
			entity: 1,
			title: 2,
			name: 3,
			schema: "wrong",
			status: "inactivetoday",
		});
		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.entity[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.name[0]);
		assert.isString(body.validation.body.schema[0]);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error if device custom field id is wrong", async () => {
		const { statusCode, body } = await server.put("/v1/device-custom-fields/9999").send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if device custom field id is wrong type", async () => {
		const { statusCode, body } = await server.put("/v1/device-custom-fields/stringid").send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
