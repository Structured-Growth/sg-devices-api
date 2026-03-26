import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	NotFoundError,
	ValidateFuncArgs,
	SearchResultInterface,
	I18nType,
	EventMutation,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { DeviceCustomFieldAttributes } from "../../../database/models/device-custom-field";
import { DeviceCustomFieldCreateBodyInterface } from "../../interfaces/device-custom-field-create-body.interface";
import { DeviceCustomFieldSearchParamsInterface } from "../../interfaces/device-custom-field-search-params.interface";
import { DeviceCustomFieldUpdateBodyInterface } from "../../interfaces/device-custom-field-update-body.interface";
import { DeviceCustomFieldRepository } from "../../modules/device-custom-fields/device-custom-field.repository";
import { DeviceCustomFieldService } from "../../modules/device-custom-fields/device-custom-field.service";
import { DeviceCustomFieldSearchParamsValidator } from "../../validators/device-custom-field-search-params.validator";
import { DeviceCustomFieldCreateParamsValidator } from "../../validators/device-custom-field-create-params.validator";
import { DeviceCustomFieldUpdateParamsValidator } from "../../validators/device-custom-field-update-params.validator";
import { DeviceCustomFieldReadParamsValidator } from "../../validators/device-custom-field-read-params.validator";
import { DeviceCustomFieldDeleteParamsValidator } from "../../validators/device-custom-field-delete-params.validator";

const publicDeviceCustomFieldAttributes = [
	"id",
	"orgId",
	"region",
	"entity",
	"title",
	"name",
	"schema",
	"createdAt",
	"updatedAt",
	"status",
	"arn",
] as const;
type DeviceCustomFieldKeys = (typeof publicDeviceCustomFieldAttributes)[number];
type PublicDeviceCustomFieldAttributes = Pick<DeviceCustomFieldAttributes, DeviceCustomFieldKeys>;

@Route("v1/device-custom-fields")
@Tags("Device Custom Fields")
@autoInjectable()
export class DeviceCustomFieldsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("DeviceCustomFieldRepository") private deviceCustomFieldRepository: DeviceCustomFieldRepository,
		@inject("DeviceCustomFieldService") private deviceCustomFieldService: DeviceCustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Device Custom Fields
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of device custom fields")
	@DescribeAction("device-custom-fields/search")
	@DescribeResource("Organization", ({ query }) => [Number(query.orgId)])
	@DescribeResource("CustomField", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(DeviceCustomFieldSearchParamsValidator)
	async search(
		@Queries() query: DeviceCustomFieldSearchParamsInterface
	): Promise<SearchResultInterface<PublicDeviceCustomFieldAttributes>> {
		const { data, ...result } = await this.deviceCustomFieldService.search({
			...query,
			includeInherited: query.includeInherited?.toString() !== "false",
		});

		return {
			data: data.map((deviceCustomField) => ({
				...(pick(deviceCustomField.toJSON(), publicDeviceCustomFieldAttributes) as PublicDeviceCustomFieldAttributes),
				arn: deviceCustomField.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Device Custom Field.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created device custom field")
	@DescribeAction("device-custom-fields/create")
	@DescribeResource("Organization", ({ body }) => [Number(body.orgId)])
	@ValidateFuncArgs(DeviceCustomFieldCreateParamsValidator)
	async create(
		@Queries() query: {},
		@Body() body: DeviceCustomFieldCreateBodyInterface
	): Promise<PublicDeviceCustomFieldAttributes> {
		const deviceCustomField = await this.deviceCustomFieldRepository.create({
			...body,
			status: body.status || "active",
		});
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				deviceCustomField.arn,
				`${this.appPrefix}:device-custom-fields/create`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(deviceCustomField.toJSON(), publicDeviceCustomFieldAttributes) as PublicDeviceCustomFieldAttributes),
			arn: deviceCustomField.arn,
		};
	}

	/**
	 * Get Device Custom Field
	 */
	@OperationId("Read")
	@Get("/:deviceCustomFieldId")
	@SuccessResponse(200, "Returns device custom field")
	@DescribeAction("device-custom-fields/read")
	@DescribeResource("DeviceCustomField", ({ params }) => [Number(params.deviceCustomFieldId)])
	@ValidateFuncArgs(DeviceCustomFieldReadParamsValidator)
	async get(@Path() deviceCustomFieldId: number): Promise<PublicDeviceCustomFieldAttributes> {
		const deviceCustomField = await this.deviceCustomFieldRepository.read(deviceCustomFieldId);

		if (!deviceCustomField) {
			throw new NotFoundError(
				`${this.i18n.__("error.device_custom_field.name")} ${deviceCustomFieldId} ${this.i18n.__(
					"error.common.not_found"
				)}`
			);
		}

		return {
			...(pick(deviceCustomField.toJSON(), publicDeviceCustomFieldAttributes) as PublicDeviceCustomFieldAttributes),
			arn: deviceCustomField.arn,
		};
	}

	/**
	 * Update Device Custom Field
	 */
	@OperationId("Update")
	@Put("/:deviceCustomFieldId")
	@SuccessResponse(200, "Returns updated device custom field")
	@DescribeAction("device-custom-fields/update")
	@DescribeResource("DeviceCustomField", ({ params }) => [Number(params.deviceCustomFieldId)])
	@ValidateFuncArgs(DeviceCustomFieldUpdateParamsValidator)
	async update(
		@Path() deviceCustomFieldId: number,
		@Queries() query: {},
		@Body() body: DeviceCustomFieldUpdateBodyInterface
	): Promise<PublicDeviceCustomFieldAttributes> {
		const deviceCustomField = await this.deviceCustomFieldRepository.update(deviceCustomFieldId, body);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				deviceCustomField.arn,
				`${this.appPrefix}:device-custom-fields/update`,
				JSON.stringify(body)
			)
		);

		return {
			...(pick(deviceCustomField.toJSON(), publicDeviceCustomFieldAttributes) as PublicDeviceCustomFieldAttributes),
			arn: deviceCustomField.arn,
		};
	}

	/**
	 * Mark Device Custom Field as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:deviceCustomFieldId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("device-custom-fields/delete")
	@DescribeResource("DeviceCustomField", ({ params }) => [Number(params.deviceCustomFieldId)])
	@ValidateFuncArgs(DeviceCustomFieldDeleteParamsValidator)
	async delete(@Path() deviceCustomFieldId: number): Promise<void> {
		const deviceCustomField = await this.deviceCustomFieldRepository.read(deviceCustomFieldId);

		if (!deviceCustomField) {
			throw new NotFoundError(
				`${this.i18n.__("error.device_custom_field.name")} ${deviceCustomFieldId} ${this.i18n.__(
					"error.common.not_found"
				)}`
			);
		}

		await this.deviceCustomFieldRepository.delete(deviceCustomFieldId);

		await this.eventBus.publish(
			new EventMutation(
				this.principal.arn,
				deviceCustomField.arn,
				`${this.appPrefix}:device-custom-fields/delete`,
				JSON.stringify({})
			)
		);

		this.response.status(204);
	}
}
