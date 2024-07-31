import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { DeviceAttributes, EnumDeviceCategoryId, EnumDeviceTypeId } from "../../database/models/device";

export interface DeviceSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
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
