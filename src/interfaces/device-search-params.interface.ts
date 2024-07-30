import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { DeviceCategoryId, DeviceTypeId, DeviceAttributes } from "../../database/models/device";

export interface DeviceSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
	accountId?: number;
	userId?: number;
	deviceCategoryId?: DeviceCategoryId;
	deviceTypeId?: DeviceTypeId;
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status?: DeviceAttributes["status"];
}
