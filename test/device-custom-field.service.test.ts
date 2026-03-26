import "reflect-metadata";
import { assert } from "chai";
import { ValidationError, joi, container } from "@structured-growth/microservice-sdk";
import { Op } from "sequelize";
import DeviceCustomField from "../database/models/device-custom-field";
import { DeviceCustomFieldService } from "../src/modules/device-custom-fields/device-custom-field.service";

describe("DeviceCustomFieldService", () => {
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
	const cache = {
		async get() {
			return [];
		},
		async setWithTags() {
			return true;
		},
	} as any;

	const service = new DeviceCustomFieldService(repository, cache);
	const originalTranslateApiUrl = process.env.TRANSLATE_API_URL;
	const originalTranslateApiClientId = process.env.TRANSLATE_API_CLIENT_ID;
	const originalAccountApiUrl = process.env.ACCOUNT_API_URL;
	const originalFetch = global.fetch;

	before(() => {
		process.env.TRANSLATE_API_URL = "";
		delete process.env.TRANSLATE_API_CLIENT_ID;
		process.env.ACCOUNT_API_URL = "http://account-api.local";
		container.register("AuthService", {
			useValue: {
				generateInternalAccessToken: () => "test-token",
			},
		});
	});

	after(() => {
		process.env.TRANSLATE_API_URL = originalTranslateApiUrl;
		process.env.TRANSLATE_API_CLIENT_ID = originalTranslateApiClientId;
		process.env.ACCOUNT_API_URL = originalAccountApiUrl;
		global.fetch = originalFetch;
	});

	afterEach(() => {
		delete (DeviceCustomField as any).findAll;
		global.fetch = originalFetch;
		searchParams = undefined;
		cache.get = async () => [];
		cache.setWithTags = async () => true;
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

	it("search uses cached parent organizations when includeInherited is true", async () => {
		const serviceWithCachedParents = new DeviceCustomFieldService(
			repository,
			{
				async get(key: string) {
					assert.equal(key, "device-custom-fields:organization-parents:55");
					return [11, 12];
				},
				async setWithTags() {
					assert.fail("setWithTags should not be called when cache hit");
				},
			} as any
		);

		await serviceWithCachedParents.search({
			orgId: 55,
			entity: ["Device"],
			includeInherited: true,
		});

		assert.deepEqual(searchParams?.orgId, [55, 11, 12]);
	});

	it("search fetches parent organizations from account api and caches them", async () => {
		let cachedKey: string | undefined;
		let cachedValue: unknown;
		let cachedTags: string[] | undefined;
		let cachedTtl: number | undefined;

		const serviceWithFetch = new DeviceCustomFieldService(
			repository,
			{
				async get() {
					return null;
				},
				async setWithTags(key: string, value: unknown, tags: string[], ttlSec: number) {
					cachedKey = key;
					cachedValue = value;
					cachedTags = tags;
					cachedTtl = ttlSec;
					return true;
				},
			} as any
		);

		global.fetch = (async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
			const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
			assert.equal(url, "http://account-api.local/v1/organizations/55/parents");
			assert.equal((init?.headers as Record<string, string>)?.Authorization, "Bearer test-token");

			return new Response(JSON.stringify([{ id: 11 }, { id: 12 }]), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}) as typeof global.fetch;

		await serviceWithFetch.search({
			orgId: 55,
			entity: ["Device"],
			includeInherited: true,
		});

		assert.deepEqual(searchParams?.orgId, [55, 11, 12]);
		assert.equal(cachedKey, "device-custom-fields:organization-parents:55");
		assert.deepEqual(cachedValue, [11, 12]);
		assert.deepEqual(cachedTags, [
			"device-custom-fields:organization-parents",
			"device-custom-fields:organization-parents:55",
		]);
		assert.equal(cachedTtl, 60 * 60 * 24 * 30);
	});

	it("validate returns valid when no custom fields found", async () => {
		(DeviceCustomField as any).findAll = async (params: Record<string, any>) => {
			assert.deepEqual(params.where.orgId[Op.or], [101]);
			return [];
		};

		const result = await service.validate("Device", {}, 101);

		assert.equal(result.valid, true);
		assert.isUndefined(result.message);
		assert.isUndefined(result.errors);
	});

	it("validate includes inherited parent organizations from cache", async () => {
		const serviceWithCachedParents = new DeviceCustomFieldService(
			repository,
			{
				async get(key: string) {
					assert.equal(key, "device-custom-fields:organization-parents:101");
					return [11, 12];
				},
				async setWithTags() {
					assert.fail("setWithTags should not be called when cache hit");
				},
			} as any
		);

		(DeviceCustomField as any).findAll = async (params: Record<string, any>) => {
			assert.deepEqual(params.where.orgId[Op.or], [101, 11, 12]);
			return [];
		};

		const result = await serviceWithCachedParents.validate("Device", {}, 101);

		assert.equal(result.valid, true);
	});

	it("validate returns success for valid metadata", async () => {
		(DeviceCustomField as any).findAll = async () => [
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
		(DeviceCustomField as any).findAll = async () => [
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
			false
		);

		assert.equal(result.valid, false);
		assert.isString((result.errors as any).calCode[0]);
	});

	it("validate throws ValidationError for invalid metadata by default", async () => {
		(DeviceCustomField as any).findAll = async () => [
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
