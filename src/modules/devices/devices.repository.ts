import { Op } from "sequelize";
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

	public async create(params: DeviceCreationAttributes): Promise<Device> {
		return Device.create(params);
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
