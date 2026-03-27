import {
	autoInjectable,
	inject,
	joi,
	validate,
	ValidationError,
	SearchResultInterface,
	CacheService,
	ServerError,
	signedInternalFetch,
} from "@structured-growth/microservice-sdk";
import { Op } from "sequelize";
import CustomField from "../../../database/models/custom-field";
import { CustomFieldSearchParamsInterface } from "../../interfaces/custom-field-search-params.interface";
import { CustomFieldRepository } from "./custom-field.repository";

const ORGANIZATION_PARENTS_CACHE_TTL_SEC = 60 * 60 * 24 * 30;
const ORGANIZATION_PARENTS_CACHE_TAG = "custom-fields:organization-parents";

@autoInjectable()
export class CustomFieldService {
	constructor(
		@inject("CustomFieldRepository") private customFieldRepository: CustomFieldRepository,
		@inject("CacheService") private cacheService: CacheService
	) {}

	public async search(
		params: CustomFieldSearchParamsInterface
	): Promise<SearchResultInterface<CustomField>> {
		const includeInherited = params.includeInherited !== false;
		const parentOrganizationIds = includeInherited ? await this.getParentOrganizationIds(params.orgId) : [];

		return this.customFieldRepository.search({
			...params,
			orgId: [params.orgId, ...parentOrganizationIds],
		});
	}

	public async validate(
		entityName: string,
		data: Record<string, unknown>,
		orgId: number,
		throwError = true
	): Promise<{
		valid: boolean;
		message?: string;
		errors?: object;
	}> {
		const customFields = await CustomField.findAll({
			where: {
				entity: entityName,
				orgId: {
					[Op.or]: [orgId, ...(await this.getParentOrganizationIds(orgId))],
				},
			},
		});
		const validator = joi.object(
			customFields.reduce((acc, item) => {
				acc[item.name] = joi.build(item.schema);
				return acc;
			}, {})
		);

		const { valid, message, errors } = await validate(validator, data);

		if (!valid && throwError) {
			throw new ValidationError({
				body: {
					metadata: errors,
				},
			});
		}

		return { valid, message, errors };
	}

	private async getParentOrganizationIds(orgId: number): Promise<number[]> {
		const cacheKey = `${ORGANIZATION_PARENTS_CACHE_TAG}:${orgId}`;
		const cached = await this.cacheService.get<number[]>(cacheKey);

		if (cached !== null) {
			return cached;
		}

		const response = await signedInternalFetch(`${process.env.ACCOUNT_API_URL}/v1/organizations/${orgId}/parents`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new ServerError(`Failed to fetch parent organizations. Status: ${response.status}`);
		}

		const payload = await response.json();
		const parentOrganizationIds = Array.isArray(payload)
			? payload.map((item) => Number(item?.id)).filter((id) => Number.isInteger(id) && id > 0)
			: [];

		await this.cacheService.setWithTags(
			cacheKey,
			parentOrganizationIds,
			[ORGANIZATION_PARENTS_CACHE_TAG, `${ORGANIZATION_PARENTS_CACHE_TAG}:${orgId}`],
			ORGANIZATION_PARENTS_CACHE_TTL_SEC
		);

		return parentOrganizationIds;
	}
}
