import { DeviceAttributes, EnumDeviceCategoryId, EnumDeviceTypeId } from "../../database/models/device";

export interface DeviceUpdateBodyInterface {
	accountId?: number;
	userId?: number;
	deviceCategoryId?: EnumDeviceCategoryId;
	deviceTypeId?: EnumDeviceTypeId;
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status?: DeviceAttributes["status"];
}
