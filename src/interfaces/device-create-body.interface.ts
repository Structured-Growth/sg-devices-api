import { RegionEnum } from "@structured-growth/microservice-sdk";
import { DeviceCategoryId, DeviceTypeId } from "../../database/models/device";
export interface DeviceCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	accountId: number;
	userId: number;
	deviceCategoryId: DeviceCategoryId;
	deviceTypeId: DeviceTypeId;
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status: "active" | "inactive";
}
