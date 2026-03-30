import "reflect-metadata";
import { assert } from "chai";
import { ValidationError, joi, container } from "@structured-growth/microservice-sdk";
import { Op } from "sequelize";
import CustomField from "../database/models/custom-field";
import { CustomFieldService } from "../src/modules/custom-fields/custom-field.service";

describe("CustomFieldService", () => {
	const originalTranslateApiUrl = process.env.TRANSLATE_API_URL;
	let searchParams: Record<string, unknown> | undefined;
	const repository = {
		async search(params: Record<string, unknown>) {
			searchParams = params;
			return {
				data: [{ id: 2, ...params }],
				total: 1,
				limit: 20,
				page: 1,
			};
		},
	} as any;

	const service = new CustomFieldService(repository);

	before(() => {
		process.env.TRANSLATE_API_URL = "";
		container.register("AuthService", {
			useValue: {
				generateInternalAccessToken: () => "test-token",
			},
		});
	});

	after(() => {
		process.env.TRANSLATE_API_URL = originalTranslateApiUrl;
	});

	afterEach(() => {
		delete (CustomField as any).findAll;
		searchParams = undefined;
	});

	it("search delegates to repository without inherited orgs", async () => {
		const result = await service.search({
			orgId: 55,
			entity: ["Device"],
			includeInherited: false,
		});

		assert.equal(result.total, 1);
		assert.deepEqual(searchParams?.orgId, [55]);
	});

	it("search includes inherited org ids from principal context", async () => {
		await service.search(
			{
				orgId: 55,
				entity: ["Device"],
				includeInherited: true,
			},
			[11, 12]
		);

		assert.deepEqual(searchParams?.orgId, [55, 11, 12]);
	});

	it("search ignores invalid or duplicate inherited org ids", async () => {
		await service.search(
			{
				orgId: 55,
				entity: ["Device"],
				includeInherited: true,
			},
			[55, 11, 0, -1, 11, 12]
		);

		assert.deepEqual(searchParams?.orgId, [55, 11, 12]);
	});

	it("validate returns valid when no custom fields found", async () => {
		(CustomField as any).findAll = async (params: Record<string, any>) => {
			assert.deepEqual(params.where.orgId[Op.or], [101]);
			return [];
		};

		const result = await service.validate("Device", {}, 101);

		assert.equal(result.valid, true);
		assert.isUndefined(result.message);
		assert.isUndefined(result.errors);
	});

	it("validate includes inherited org ids from principal context", async () => {
		(CustomField as any).findAll = async (params: Record<string, any>) => {
			assert.deepEqual(params.where.orgId[Op.or], [101, 11, 12]);
			return [];
		};

		const result = await service.validate("Device", {}, 101, [11, 12]);

		assert.equal(result.valid, true);
	});

	it("validate returns success for valid metadata", async () => {
		(CustomField as any).findAll = async () => [
			{
				name: "calCode",
				schema: joi.string().min(2).describe(),
			},
		];

		const result = await service.validate(
			"Device",
			{
				calCode: "AB",
			},
			101
		);

		assert.equal(result.valid, true);
	});

	it("validate returns errors without throwing when throwError is false", async () => {
		(CustomField as any).findAll = async () => [
			{
				name: "calCode",
				schema: joi.string().min(3).describe(),
			},
		];

		const result = await service.validate(
			"Device",
			{
				calCode: "AB",
			},
			101,
			[],
			false
		);

		assert.equal(result.valid, false);
		assert.isString((result.errors as any).calCode[0]);
	});

	it("validate throws ValidationError for invalid metadata by default", async () => {
		(CustomField as any).findAll = async () => [
			{
				name: "calCode",
				schema: joi.string().min(3).describe(),
			},
		];

		try {
			await service.validate(
				"Device",
				{
					calCode: "AB",
				},
				101
			);
			assert.fail("Expected ValidationError");
		} catch (error) {
			assert.instanceOf(error, ValidationError);
			assert.isString((error as any).validation.body.metadata.calCode[0]);
		}
	});
});
