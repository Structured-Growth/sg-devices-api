import { Op, Sequelize } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import Device, { DeviceCreationAttributes, DeviceUpdateAttributes } from "../../../database/models/device";
import { DeviceSearchParamsInterface } from "../../interfaces/device-search-params.interface";
import { Transaction } from "sequelize";

@autoInjectable()
export class DevicesRepository
	implements RepositoryInterface<Device, DeviceSearchParamsInterface, DeviceCreationAttributes>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(params: DeviceSearchParamsInterface): Promise<SearchResultInterface<Device>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];
		const metadata = (params as any).metadata;

		const qRaw = (params as any).q;
		const q = typeof qRaw === "string" ? qRaw.trim() : "";

		if (q) {
			const like = q.includes("*") ? q.replace(/\*/g, "%") : `%${q}%`;

			const or: any[] = [];

			or.push({ serialNumber: { [Op.iLike]: like } });

			const asNumber = Number(q);
			const isFiniteInt = Number.isFinite(asNumber) && Number.isInteger(asNumber);

			if (isFiniteInt) {
				or.push({ id: asNumber });
				or.push({ accountId: asNumber });
				or.push({ userId: asNumber });
			}

			where[Op.and] = where[Op.and] ?? [];
			where[Op.and].push({ [Op.or]: or });
		}

		params.orgId && (where["orgId"] = params.orgId);
		params.accountId && (where["accountId"] = params.accountId);
		params.userId && (where["userId"] = params.userId);
		params.status && (where["status"] = params.status);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.deviceCategoryId && (where["deviceCategoryId"] = params.deviceCategoryId);
		params.deviceTypeId && (where["deviceTypeId"] = { [Op.in]: params.deviceTypeId });
		params.manufacturer && (where["manufacturer"] = params.manufacturer);
		params.modelNumber && (where["modelNumber"] = params.modelNumber);
		params.serialNumber && (where["serialNumber"] = params.serialNumber);
		params.imei && (where["imei"] = params.imei);

		if (metadata && typeof metadata === "object") {
			where[Op.and] = where[Op.and] ?? [];

			for (const [keyRaw, valRaw] of Object.entries(metadata)) {
				if (valRaw === null || valRaw === undefined) continue;

				const key = String(keyRaw).replace(/[^a-zA-Z0-9_]/g, "");
				if (!key) continue;

				const v = String(valRaw).trim();
				if (!v) continue;

				const left = Sequelize.literal(`("metadata"->>'${key}')`);

				if (v.includes("*")) {
					const like = v.replace(/\*/g, "%");
					where[Op.and].push(Sequelize.where(left, { [Op.iLike]: like }));
				} else {
					where[Op.and].push(Sequelize.where(left, { [Op.eq]: v }));
				}
			}
		}

		const { rows, count } = await Device.findAndCountAll({
			where,
			offset,
			limit,
			order,
		});

		return {
			data: rows,
			total: count,
			limit,
			page,
		};
	}

	public async create(params: DeviceCreationAttributes, transaction?: Transaction): Promise<Device> {
		return Device.create(params, { transaction });
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Device> {
		return Device.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: DeviceUpdateAttributes): Promise<Device> {
		const device = await this.read(id);
		if (!device) {
			throw new NotFoundError(`${this.i18n.__("error.device.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
		device.setAttributes(params);

		return device.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Device.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`${this.i18n.__("error.device.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
	}
}
