import { autoInjectable, inject, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import { DevicesRepository } from "./devices.repository";
import { DeviceCreateBodyInterface } from "../../interfaces/device-create-body.interface";
import Device from "../../../database/models/device";
import { Transaction } from "sequelize";

@autoInjectable()
export class DevicesService {
	private i18n: I18nType;
	constructor(
		@inject("DevicesRepository") private devicesRepository: DevicesRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
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
				throw new ValidationError({}, this.i18n.__("error.metric.exists"));
			} else {
				throw e;
			}
		}
	}
}
