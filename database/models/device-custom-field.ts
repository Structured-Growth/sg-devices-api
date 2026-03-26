import { Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface DeviceCustomFieldAttributes extends Omit<DefaultModelInterface, "accountId"> {
	entity: string;
	title: string;
	name: string;
	schema: Record<string, unknown>;
	status: "active" | "inactive" | "archived";
}

export interface DeviceCustomFieldCreationAttributes
	extends Omit<DeviceCustomFieldAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface DeviceCustomFieldUpdateAttributes
	extends Partial<Pick<DeviceCustomFieldCreationAttributes, "entity" | "title" | "name" | "schema" | "status">> {}

@Table({
	tableName: "device_custom_fields",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class DeviceCustomField
	extends Model<DeviceCustomFieldAttributes, DeviceCustomFieldCreationAttributes>
	implements DeviceCustomFieldAttributes
{
	@Column
	orgId: number;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column(DataType.STRING)
	entity: string;

	@Column(DataType.STRING)
	title: string;

	@Column(DataType.STRING)
	name: string;

	@Column(DataType.JSONB)
	schema: Record<string, unknown>;

	@Column(DataType.STRING)
	status: DeviceCustomFieldAttributes["status"];

	static get arnPattern(): string {
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<accountId>",
			"device-custom-fields/<deviceCustomFieldId>",
		].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, "-", `device-custom-fields/${this.id}`].join(":");
	}
}

export default DeviceCustomField;
