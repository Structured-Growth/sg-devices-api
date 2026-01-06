import { autoInjectable, inject, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import { DevicesRepository } from "./devices.repository";
import { DeviceCreateBodyInterface } from "../../interfaces/device-create-body.interface";
import Device from "../../../database/models/device";
import { Transaction } from "sequelize";
import { parse, unparse } from "papaparse";
import { DeviceBulkCreateParamsValidator } from "../../validators/device-bulk-create-params.validator";
import { DeviceGetProductSNParamsInterface } from "../../interfaces/device-get-product-sn-params.interface";

@autoInjectable()
export class DevicesService {
	private i18n: I18nType;
	constructor(
		@inject("DevicesRepository") private devicesRepository: DevicesRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async importFromCsv(buffer: Buffer, defaults: { orgId: number; region: string }): Promise<Device[]> {
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

		const rawData = result.data.map((item) => this.unFlattenKeys(item));

		const normalized = rawData.map((row: any) => ({
			...row,
			orgId: defaults.orgId,
			region: defaults.region,
		}));

		const { error } = DeviceBulkCreateParamsValidator.validate({ query: {}, body: normalized }, { abortEarly: false });

		if (error) {
			const errors = error.details.map((e) => `${e.message} (path: ${e.path.join(".")})`).join("; ");
			throw new ValidationError({}, `${this.i18n.__("error.upload.validation_failed")} ${errors}`);
		}

		const devices: DeviceCreateBodyInterface[] = normalized.map((row) => ({
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
			metadata: row.metadata || null,
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

	public async getProductSN(
		params: DeviceGetProductSNParamsInterface
	): Promise<{ result: Array<Record<string, string>> }> {
		const serialNumbers = (params.serialNumber || []).filter(Boolean);

		if (serialNumbers.length === 0) {
			return { result: [] };
		}

		const devices = await Device.findAll({
			where: { serialNumber: serialNumbers },
			attributes: ["serialNumber", "metadata"],
		});

		const result: Array<Record<string, string>> = [];

		for (const d of devices) {
			const ieee = d.serialNumber;
			const psn = d?.metadata?.productSerialNumber;

			if (typeof ieee === "string" && ieee && typeof psn === "string" && psn) {
				result.push({ [ieee]: psn });
			}
		}

		return { result };
	}

	public buildCsvTemplate(): string {
		const headers = (process.env.DEVICES_CSV_TEMPLATE_HEADERS || "")
			.split(",")
			.map((h) => h.trim())
			.filter(Boolean);

		const exampleStr = process.env.DEVICES_CSV_TEMPLATE_EXAMPLE || "";
		const examplePairs = exampleStr
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean);

		const exampleMap: Record<string, string> = {};
		for (const pair of examplePairs) {
			const [rawKey, ...rest] = pair.split("=");
			const key = (rawKey || "").trim();
			if (!key) continue;

			exampleMap[key] = rest.join("=").trim();
		}

		const exampleRow: Record<string, any> = {};
		for (const h of headers) {
			exampleRow[h] = Object.prototype.hasOwnProperty.call(exampleMap, h) ? exampleMap[h] : "";
		}

		return unparse([exampleRow], { columns: headers });
	}

	private unFlattenKeys(obj: { [key: string]: string }) {
		const result: object = {};
		for (const key in obj) {
			const keys = key.split(".");
			let nested = result;
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				if (i === keys.length - 1) {
					nested[k] = obj[key];
				} else {
					nested[k] = nested[k] || {};
					nested = nested[k];
				}
			}
		}
		return result;
	}
}
