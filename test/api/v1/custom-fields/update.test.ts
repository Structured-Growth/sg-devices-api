import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { customFieldAlternativesSchema } from "../../../common/custom-field-schema";

describe("PUT /api/v1/custom-fields/:customFieldId", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	it("Should create custom field", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId,
			entity: "Device",
			title: "Calibration code",
			name: "calCode",
			schema: customFieldAlternativesSchema,
			status: "active",
		});
		assert.equal(statusCode, 201);
		context.customFieldId = body.id;
	});

	it("Should update custom field", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			entity: "Device",
			title: "Expiration date",
			name: "endOfLifeDatetime",
			schema: customFieldAlternativesSchema,
			status: "inactive",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.customFieldId);
		assert.equal(body.entity, "Device");
		assert.equal(body.title, "Expiration date");
		assert.equal(body.name, "endOfLifeDatetime");
		assert.equal(body.schema.type, "alternatives");
		assert.equal(body.status, "inactive");
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			entity: 1,
			title: 2,
			name: 3,
			schema: "wrong",
			status: "inactivetoday",
		});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.entity[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.name[0]);
		assert.isString(body.validation.body.schema[0]);
		assert.isString(body.validation.body.status[0]);
	});

	it("Should return validation error for invalid name characters", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			name: "end of life!",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.name[0]);
	});

	it("Should return validation error for duplicate custom field", async () => {
		const { statusCode: createStatusCode, body: createBody } = await server.post("/v1/custom-fields").send({
			orgId,
			entity: "Device",
			title: "Calibration code 2",
			name: "otherCode",
			schema: customFieldAlternativesSchema,
			status: "active",
		});

		assert.equal(createStatusCode, 201);

		const { statusCode, body } = await server.put(`/v1/custom-fields/${createBody.id}`).send({
			entity: "Device",
			name: "endOfLifeDatetime",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.name[0]);
	});

	it("Should return validation error if custom field id is wrong", async () => {
		const { statusCode, body } = await server.put("/v1/custom-fields/9999").send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if custom field id is wrong type", async () => {
		const { statusCode, body } = await server.put("/v1/custom-fields/stringid").send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
