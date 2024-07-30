import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export enum DeviceCategoryId {
	MEDICAL = "medical",
}
export enum DeviceTypeId {
	PULSE = "pulse",
	BLOOD_PRESSURE = "blood_pressure",
	WEIGHT = "weight",
	BODY_SCALE = "body_scale",
	GLUCOSE_METER = "glucose_meter",
}

export interface DeviceAttributes extends DefaultModelInterface {
	userId: number;
	deviceCategoryId: DeviceCategoryId;
	deviceTypeId: DeviceTypeId;
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
		Pick<DeviceCreationAttributes, "manufacturer" | "modelNumber" | "serialNumber" | "imei" | "status">
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
	deviceCategoryId: DeviceCategoryId;

	@Column
	deviceTypeId: DeviceTypeId;

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
		return [
			container.resolve("appPrefix"),
			"<region>",
			"<orgId>",
			"<accountId>",
			"<userId>",
			"devices/<deviceId>",
		].join(":");
	}

	get arn(): string {
		return [
			container.resolve("appPrefix"),
			this.region,
			this.orgId,
			this.accountId,
			this.userId,
			`devices/${this.id}`,
		].join(":");
	}
}

export default Device;
