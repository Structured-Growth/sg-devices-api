import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	inject,
	SearchResultInterface,
	NotFoundError,
	I18nType,
} from "@structured-growth/microservice-sdk";
import DeviceCustomField, {
	DeviceCustomFieldCreationAttributes,
} from "../../../database/models/device-custom-field";
import { DeviceCustomFieldSearchParamsInterface } from "../../interfaces/device-custom-field-search-params.interface";
import { DeviceCustomFieldUpdateBodyInterface } from "../../interfaces/device-custom-field-update-body.interface";

type DeviceCustomFieldRepositorySearchParams = Omit<DeviceCustomFieldSearchParamsInterface, "includeInherited" | "orgId"> & {
	orgId: number[];
};

@autoInjectable()
export class DeviceCustomFieldRepository
	implements
		RepositoryInterface<
			DeviceCustomField,
			DeviceCustomFieldRepositorySearchParams,
			DeviceCustomFieldCreationAttributes
		>
{
	private i18n: I18nType;

	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}

	public async search(
		params: DeviceCustomFieldRepositorySearchParams
	): Promise<SearchResultInterface<DeviceCustomField>> {
		const page = params.page || 1;
		const limit = params.limit || 20;
		const offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = { [Op.in]: params.orgId });
		params.id && (where["id"] = { [Op.in]: params.id });
		params.entity && (where["entity"] = { [Op.in]: params.entity });
		params.status && (where["status"] = { [Op.in]: params.status });

		if (params.title?.length > 0) {
			where["title"] = {
				[Op.or]: params.title.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		if (params.name?.length > 0) {
			where["name"] = {
				[Op.or]: params.name.map((str) => ({ [Op.iLike]: str.replace(/\*/g, "%") })),
			};
		}

		const { rows, count } = await DeviceCustomField.findAndCountAll({
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

	public async create(params: DeviceCustomFieldCreationAttributes): Promise<DeviceCustomField> {
		return DeviceCustomField.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<DeviceCustomField | null> {
		return DeviceCustomField.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: DeviceCustomFieldUpdateBodyInterface): Promise<DeviceCustomField> {
		const model = await this.read(id);

		if (!model) {
			throw new NotFoundError(
				`${this.i18n.__("error.device_custom_field.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
		model.setAttributes(params);

		return model.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await DeviceCustomField.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(
				`${this.i18n.__("error.device_custom_field.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
	}
}
