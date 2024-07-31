import { RegionEnum } from "@structured-growth/microservice-sdk";
import { DeviceCategoryIdEnum, DeviceTypeIdEnum } from "../../database/models/device";
export interface DeviceCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	accountId?: number;
	userId?: number;
	deviceCategoryId: DeviceCategoryIdEnum;
	deviceTypeId: DeviceTypeIdEnum;
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status: "active" | "inactive";
}
