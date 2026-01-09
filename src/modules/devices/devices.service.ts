import { autoInjectable, inject, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import { DevicesRepository } from "./devices.repository";
import { DeviceCreateBodyInterface } from "../../interfaces/device-create-body.interface";
import Device from "../../../database/models/device";
import { Transaction } from "sequelize";
import { parse, unparse } from "papaparse";
import { DeviceGetProductSNParamsInterface } from "../../interfaces/device-get-product-sn-params.interface";
import { CsvTypesMap, CsvDefaults } from "../../interfaces/device-upload-csv.interface";
import { RegionEnum } from "@structured-growth/microservice-sdk";
import {
	parseHeaders,
	parseJson,
	compareHeaders,
	validateCell,
	asTrimmedString,
} from "../../helpers/device-upload-csv";

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

		const parsed = parse<Record<string, any>>(content, {
			header: true,
			skipEmptyLines: true,
		});

		if (parsed.errors.length > 0) {
			throw new ValidationError(
				{},
				`${this.i18n.__("error.upload.parse_error")} ${parsed.errors
					.map((e) => `${e.message} (row: ${e.row})`)
					.join("; ")}`
			);
		}

		const rows = (parsed.data ?? []) as Record<string, any>[];
		const actualHeaders = ((parsed.meta?.fields ?? []) as string[]).map((h) => (h ?? "").toString());

		const schema = this.getCsvSchemaFromEnv();

		this.validateCsvHeaders(actualHeaders, schema.expectedHeaders);

		this.validateCsvTypes(rows, schema.expectedHeaders, schema.types);

		const devices = rows.map((row) => this.mapCsvRowToDevice(row, defaults, schema.defaults));

		await this.assertSerialNumbersNotExists(devices);

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

	private getCsvSchemaFromEnv(): { expectedHeaders: string[]; types: CsvTypesMap; defaults: CsvDefaults } {
		const expectedHeaders = parseHeaders(process.env.DEVICES_CSV_FILE_HEADERS);

		if (!expectedHeaders.length) {
			throw new ValidationError({}, "CSV headers configuration is missing (DEVICES_CSV_FILE_HEADERS).");
		}

		const types = parseJson<CsvTypesMap>(process.env.DEVICES_CSV_FILE_TYPES, {});
		if (!Object.keys(types).length) {
			throw new ValidationError({}, "CSV types configuration is missing (DEVICES_CSV_FILE_TYPES).");
		}

		const missingTypeDefs = expectedHeaders.filter((h) => !types[h]);
		if (missingTypeDefs.length) {
			throw new ValidationError({}, `Missing type definitions for: ${missingTypeDefs.join(", ")}`);
		}

		const defaults = parseJson<CsvDefaults>(process.env.DEVICES_CSV_DEFAULTS, {
			deviceCategoryId: 1,
			deviceTypeId: 5,
			manufacturer: "",
			modelNumber: "",
			imei: "0",
			status: "active",
		});

		if (!defaults.deviceCategoryId || !defaults.deviceTypeId || !defaults.status) {
			throw new ValidationError(
				{},
				"CSV defaults config is missing deviceCategoryId/deviceTypeId/status (DEVICES_CSV_DEFAULTS)."
			);
		}

		return { expectedHeaders, types, defaults };
	}

	private validateCsvHeaders(actualHeaders: string[], expectedHeaders: string[]) {
		const { missing, extra, sameOrder } = compareHeaders(actualHeaders, expectedHeaders);

		if (missing.length || extra.length || !sameOrder) {
			const msg = [
				missing.length ? `Missing columns: ${missing.join(", ")}` : "",
				extra.length ? `Extra columns: ${extra.join(", ")}` : "",
				!sameOrder ? "Column order does not match template." : "",
			]
				.filter(Boolean)
				.join(" | ");

			throw new ValidationError({}, `${this.i18n.__("error.upload.validation_failed")} ${msg}`);
		}
	}

	private validateCsvTypes(rows: Record<string, any>[], expectedHeaders: string[], types: CsvTypesMap) {
		const errors: string[] = [];

		rows.forEach((row, idx) => {
			expectedHeaders.forEach((col) => {
				const rule = types[col];
				const msg = validateCell(row[col], rule);
				if (msg) errors.push(`Row ${idx + 2}, column "${col}": ${msg}`);
			});
		});

		if (errors.length) {
			throw new ValidationError({}, `${this.i18n.__("error.upload.validation_failed")} ${errors.join("; ")}`);
		}
	}

	private mapCsvRowToDevice(
		row: Record<string, any>,
		ctx: { orgId: number; region: string },
		csvDefaults: CsvDefaults
	): DeviceCreateBodyInterface {
		const serialNumber = asTrimmedString(row["IEEE"]) || undefined;

		const metadata: Record<string, any> = {};
		const sa8 = asTrimmedString(row["SA8 S/N"]);
		if (sa8) metadata.productSerialNumber = sa8;
		const cal = asTrimmedString(row["Calibration Code"]);
		if (cal) metadata.calCode = cal;
		const exp = asTrimmedString(row["Expiration Date"]);
		if (exp) {
			const d = new Date(exp);
			if (Number.isNaN(d.getTime())) {
				throw new ValidationError({}, `Invalid Expiration Date value: ${exp}`);
			}
			metadata.endOfLifeDatetime = d.toISOString();
		}

		return {
			orgId: ctx.orgId,
			region: ctx.region as RegionEnum,
			deviceCategoryId: Number(csvDefaults.deviceCategoryId),
			deviceTypeId: Number(csvDefaults.deviceTypeId),
			manufacturer: csvDefaults.manufacturer ? String(csvDefaults.manufacturer) : undefined,
			modelNumber: csvDefaults.modelNumber ? String(csvDefaults.modelNumber) : undefined,
			imei: csvDefaults.imei ? String(csvDefaults.imei) : undefined,
			status: (csvDefaults.status ?? "active") as "active" | "inactive",
			serialNumber,
			metadata: Object.keys(metadata).length ? metadata : null,
		};
	}

	private async assertSerialNumbersNotExists(devices: DeviceCreateBodyInterface[]) {
		const serialNumbers = devices.map((d) => d.serialNumber).filter((sn): sn is string => Boolean(sn));

		if (serialNumbers.length === 0) return;

		const existingDevices = await Device.findAll({
			where: { serialNumber: serialNumbers },
			attributes: ["serialNumber"],
		});

		const existingSerials = new Set(existingDevices.map((d) => d.serialNumber));
		if (existingSerials.size > 0) {
			const conflictList = [...existingSerials].join(", ");
			throw new ValidationError({}, this.i18n.__("error.device.serial_exists") + `: ${conflictList}`);
		}
	}
}
