import { DeviceAttributes, DeviceCategoryIdEnum, DeviceTypeIdEnum } from "../../database/models/device";

export interface DeviceUpdateBodyInterface {
	accountId?: number;
	userId?: number;
	deviceCategoryId?: DeviceCategoryIdEnum;
	deviceTypeId?: DeviceTypeIdEnum;
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status?: DeviceAttributes["status"];
}
