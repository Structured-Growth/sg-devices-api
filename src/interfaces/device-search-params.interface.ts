import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { DeviceAttributes, DeviceCategoryIdEnum, DeviceTypeIdEnum } from "../../database/models/device";

export interface DeviceSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId"> {
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
