import { RegionEnum } from "@structured-growth/microservice-sdk";
import { EnumDeviceCategoryId, EnumDeviceTypeId } from "../../database/models/device";
export interface DeviceCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	accountId: number;
	userId: number;
	deviceCategoryId: EnumDeviceCategoryId;
	deviceTypeId: EnumDeviceTypeId;
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status: "active" | "inactive";
}
