import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { customFieldAlternativesSchema } from "../../../common/custom-field-schema";

describe("DELETE /api/v1/custom-fields/:customFieldId", () => {
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

	it("Should delete custom field", async () => {
		const { statusCode } = await server.delete(`/v1/custom-fields/${context.customFieldId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return if custom field does not exist", async () => {
		const { statusCode, body } = await server.delete("/v1/custom-fields/99999999");
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete("/v1/custom-fields/wrong");
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.customFieldId[0]);
	});
});
