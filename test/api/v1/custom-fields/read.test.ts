import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { customFieldAlternativesSchema } from "../../../common/custom-field-schema";

describe("GET /api/v1/custom-fields/:customFieldId", () => {
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
		assert.isNumber(body.id);
		context["customFieldId"] = body.id;
	});

	it("Should read custom field", async () => {
		const { statusCode, body } = await server.get(`/v1/custom-fields/${context.customFieldId}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.customFieldId);
		assert.equal(body.orgId, orgId);
		assert.equal(body.region, "us");
		assert.equal(body.entity, "Device");
		assert.equal(body.title, "Calibration code");
		assert.equal(body.name, "calCode");
		assert.equal(body.schema.type, "alternatives");
		assert.equal(body.status, "active");
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});

	it("Should return if custom field does not exist", async () => {
		const { statusCode, body } = await server.get("/v1/custom-fields/999999").send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});
});
