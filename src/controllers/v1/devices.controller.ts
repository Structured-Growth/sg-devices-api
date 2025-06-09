import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	NotFoundError,
	BadRequestError,
	SearchResultInterface,
	ValidateFuncArgs,
	I18nType,
	ValidationError,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { DeviceAttributes } from "../../../database/models/device";
import { DevicesRepository } from "../../modules/devices/devices.repository";
import { DevicesService } from "../../modules/devices/devices.service";
import { DeviceCreateBodyInterface } from "../../interfaces/device-create-body.interface";
import { DeviceSearchParamsInterface } from "../../interfaces/device-search-params.interface";
import { DeviceUpdateBodyInterface } from "../../interfaces/device-update-body.interface";
import { DeviceSearchParamsValidator } from "../../validators/device-search-params.validator";
import { DeviceCreateParamsValidator } from "../../validators/device-create-params.validator";
import { DeviceBulkCreateParamsValidator } from "../../validators/device-bulk-create-params.validator";
import { DeviceReadParamsValidator } from "../../validators/device-read-params.validator";
import { DeviceUpdateParamsValidator } from "../../validators/device-update-params.validator";
import { DeviceDeleteParamsValidator } from "../../validators/device-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

const publicDeviceAttributes = [
	"id",
	"orgId",
	"region",
	"accountId",
	"userId",
	"deviceCategoryId",
	"deviceTypeId",
	"manufacturer",
	"modelNumber",
	"serialNumber",
	"imei",
	"status",
	"createdAt",
	"updatedAt",
	"metadata",
	"arn",
] as const;
type DeviceKeys = (typeof publicDeviceAttributes)[number];
type PublicDeviceAttributes = Pick<DeviceAttributes, DeviceKeys>;

@Route("v1/devices")
@Tags("Devices")
@autoInjectable()
export class DevicesController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("DevicesRepository") private devicesRepository: DevicesRepository,
		@inject("DevicesService") private devicesService: DevicesService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Devices
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of devices")
	@DescribeAction("devices/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Account", ({ query }) => Number(query.accountId))
	@DescribeResource("User", ({ query }) => Number(query.userId))
	@DescribeResource("Device", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(DeviceSearchParamsValidator)
	async search(@Queries() query: DeviceSearchParamsInterface): Promise<SearchResultInterface<PublicDeviceAttributes>> {
		const { data, ...result } = await this.devicesRepository.search(query);

		return {
			data: data.map((device) => ({
				...(pick(device.toJSON(), publicDeviceAttributes) as PublicDeviceAttributes),
				arn: device.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Device.
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created device")
	@DescribeAction("devices/create")
	@ValidateFuncArgs(DeviceCreateParamsValidator)
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Account", ({ body }) => Number(body.accountId))
	@DescribeResource("User", ({ body }) => Number(body.userId))
	async create(@Queries() query: {}, @Body() body: DeviceCreateBodyInterface): Promise<PublicDeviceAttributes> {
		const device = await this.devicesRepository.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, device.arn, `${this.appPrefix}:devices/create`, JSON.stringify(body))
		);

		return {
			...(pick(device.toJSON(), publicDeviceAttributes) as PublicDeviceAttributes),
			arn: device.arn,
		};
	}

	/**
	 * Bulk Create Devices.
	 */
	@OperationId("Bulk")
	@Post("/bulk")
	@SuccessResponse(201, "Returns created devices")
	@DescribeAction("devices/bulk")
	@ValidateFuncArgs(DeviceBulkCreateParamsValidator)
	async bulk(@Queries() query: {}, @Body() body: DeviceCreateBodyInterface[]): Promise<PublicDeviceAttributes[]> {
		this.response.status(201);

		const createdDevices = await this.devicesService.bulk(body);

		for (const [index, device] of createdDevices.entries()) {
			await this.eventBus.publish(
				new EventMutation(
					this.principal.arn,
					device.arn,
					`${this.appPrefix}:devices/create`,
					JSON.stringify(body[index])
				)
			);
		}

		return createdDevices.map((device) => ({
			...(pick(device.toJSON(), publicDeviceAttributes) as PublicDeviceAttributes),
			arn: device.arn,
		}));
	}

	/**
	 * Upload devices from CSV
	 */
	@OperationId("UploadCSV")
	@Post("/upload")
	@SuccessResponse(200, "CSV file processed")
	@DescribeAction("devices/upload")
	async uploadCsv(@Queries() query: {}): Promise<{ success: boolean; created: number }> {
		if (!this.request.files || !Array.isArray(this.request.files) || this.request.files.length === 0) {
			throw new ValidationError({}, this.i18n.__("error.upload.no_file"));
		}

		const file = this.request.files[0];

		if (!file || file.mimetype !== "text/csv") {
			throw new ValidationError({}, this.i18n.__("error.upload.invalid_file"));
		}

		const result = await this.devicesService.importFromCsv(file.buffer);

		this.response.status(201);
		return { success: true, created: result.length };
	}

	/**
	 * Get Device
	 */
	@OperationId("Read")
	@Get("/:deviceId")
	@SuccessResponse(200, "Returns device")
	@DescribeAction("devices/read")
	@DescribeResource("Device", ({ params }) => Number(params.deviceId))
	@ValidateFuncArgs(DeviceReadParamsValidator)
	async get(@Path() deviceId: number): Promise<PublicDeviceAttributes> {
		const device = await this.devicesRepository.read(deviceId);

		if (!device) {
			throw new NotFoundError(
				`${this.i18n.__("error.device.name")} ${device} ${this.i18n.__("error.common.not_found")}`
			);
		}

		return {
			...(pick(device.toJSON(), publicDeviceAttributes) as PublicDeviceAttributes),
			arn: device.arn,
		};
	}

	/**
	 * Update Device
	 */
	@OperationId("Update")
	@Put("/:deviceId")
	@SuccessResponse(200, "Returns updated device")
	@DescribeAction("devices/update")
	@DescribeResource("Device", ({ params }) => Number(params.deviceId))
	@ValidateFuncArgs(DeviceUpdateParamsValidator)
	async update(
		@Path() deviceId: number,
		@Queries() query: {},
		@Body() body: DeviceUpdateBodyInterface
	): Promise<PublicDeviceAttributes> {
		const device = await this.devicesRepository.update(deviceId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, device.arn, `${this.appPrefix}:devices/update`, JSON.stringify(body))
		);

		return {
			...(pick(device.toJSON(), publicDeviceAttributes) as PublicDeviceAttributes),
			arn: device.arn,
		};
	}

	/**
	 * Mark Device as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:deviceId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("devices/delete")
	@DescribeResource("Device", ({ params }) => Number(params.deviceId))
	@ValidateFuncArgs(DeviceDeleteParamsValidator)
	async delete(@Path() deviceId: number): Promise<void> {
		const device = await this.devicesRepository.read(deviceId);

		if (!device) {
			throw new NotFoundError(
				`${this.i18n.__("error.device.name")} ${deviceId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		await this.devicesRepository.delete(deviceId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, device.arn, `${this.appPrefix}:devices/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
