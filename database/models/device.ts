import { Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export enum EnumDeviceCategoryId {
	MEDICAL = 1,
}
export enum EnumDeviceTypeId {
	PULSE = 1,
	BLOOD_PRESSURE = 2,
	WEIGHT = 3,
	BODY_SCALE = 4,
	GLUCOSE_METER = 5,
}

export interface DeviceAttributes extends DefaultModelInterface {
	userId: number;
	deviceCategoryId: EnumDeviceCategoryId;
	deviceTypeId: EnumDeviceTypeId;
	manufacturer?: string | null;
	modelNumber?: string | null;
	serialNumber?: string | null;
	imei?: string | null;
	status: "active" | "inactive" | "archived";
}

export interface DeviceCreationAttributes
	extends Omit<DeviceAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface DeviceUpdateAttributes
	extends Partial<
		Pick<
			DeviceCreationAttributes,
			| "accountId"
			| "userId"
			| "deviceCategoryId"
			| "deviceTypeId"
			| "manufacturer"
			| "modelNumber"
			| "serialNumber"
			| "imei"
			| "status"
		>
	> {}

@Table({
	tableName: "devices",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
	@Column
	orgId: number;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column
	accountId: number;

	@Column
	userId: number;

	@Column
	deviceCategoryId: EnumDeviceCategoryId;

	@Column
	deviceTypeId: EnumDeviceTypeId;

	@Column
	manufacturer: string;

	@Column
	modelNumber: string;

	@Column
	serialNumber: string;

	@Column
	imei: string;

	@Column(DataType.STRING)
	status: DeviceAttributes["status"];

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "devices/<deviceId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `devices/${this.id}`].join(":");
	}
}

export default Device;
