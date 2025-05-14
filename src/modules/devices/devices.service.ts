import { autoInjectable, inject, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import { DevicesRepository } from "./devices.repository";
import { DeviceCreateBodyInterface } from "../../interfaces/device-create-body.interface";
import Device from "../../../database/models/device";
import { Transaction } from "sequelize";
import { parse } from "papaparse";
import { DeviceBulkCreateParamsValidator } from "../../validators/device-bulk-create-params.validator";

@autoInjectable()
export class DevicesService {
	private i18n: I18nType;
	constructor(
		@inject("DevicesRepository") private devicesRepository: DevicesRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async importFromCsv(buffer: Buffer): Promise<Device[]> {
		const content = buffer.toString("utf-8");

		const result = parse<Record<string, any>>(content, {
			header: true,
			skipEmptyLines: true,
		});

		if (result.errors.length > 0) {
			throw new ValidationError(
				{},
				`${this.i18n.__("error.upload.parse_error")} ${result.errors
					.map((e) => `${e.message} (row: ${e.row})`)
					.join("; ")}`
			);
		}

		const rawData = result.data;

		const { error } = DeviceBulkCreateParamsValidator.validate({ query: {}, body: rawData }, { abortEarly: false });

		if (error) {
			const errors = error.details.map((e) => `${e.message} (path: ${e.path.join(".")})`).join("; ");
			throw new ValidationError({}, `${this.i18n.__("error.upload.validation_failed")} ${errors}`);
		}

		const devices: DeviceCreateBodyInterface[] = rawData.map((row) => ({
			orgId: Number(row.orgId),
			region: row.region,
			accountId: row.accountId ? Number(row.accountId) : undefined,
			userId: row.userId ? Number(row.userId) : undefined,
			deviceCategoryId: Number(row.deviceCategoryId),
			deviceTypeId: Number(row.deviceTypeId),
			manufacturer: row.manufacturer || undefined,
			modelNumber: row.modelNumber || undefined,
			serialNumber: row.serialNumber || undefined,
			imei: row.imei || undefined,
			status: row.status || undefined,
		}));

		const serialNumbers = devices.map((d) => d.serialNumber).filter((sn): sn is string => Boolean(sn));

		if (serialNumbers.length > 0) {
			const existingDevices = await Device.findAll({
				where: {
					serialNumber: serialNumbers,
				},
				attributes: ["serialNumber"],
			});

			const existingSerials = new Set(existingDevices.map((d) => d.serialNumber));

			if (existingSerials.size > 0) {
				const conflictList = [...existingSerials].join(", ");
				throw new ValidationError({}, this.i18n.__("error.device.serial_exists") + `: ${conflictList}`);
			}
		}

		return await this.bulk(devices);
	}

	public async bulk(devices: DeviceCreateBodyInterface[]): Promise<Device[]> {
		return await Device.sequelize.transaction(async (transaction) => {
			return await this.createAll(devices, transaction);
		});
	}

	public async createAll(params: DeviceCreateBodyInterface[], transaction?: Transaction): Promise<Device[]> {
		try {
			return await Device.bulkCreate(params, { transaction });
		} catch (e) {
			if (e.name === "SequelizeUniqueConstraintError") {
				throw new ValidationError({}, this.i18n.__("error.device.exists"));
			} else {
				throw e;
			}
		}
	}
}
