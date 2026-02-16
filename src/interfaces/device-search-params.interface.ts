import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { DeviceAttributes, DeviceCategoryIdEnum, DeviceTypeIdEnum } from "../../database/models/device";

export interface DeviceSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId"> {
	orgId?: number;
	accountId?: number;
	userId?: number;
	/**
	 * 1 - MEDICAL DEVICES
	 */
	deviceCategoryId?: number;
	/**
	 * 1 - PULSE<br />
	 * 2 - BLOOD_PRESSURE<br />
	 * 3 - WEIGHT<br />
	 * 4 - BODY_SCALE<br />
	 * 5 - GLUCOSE_METER<br />
	 */
	deviceTypeId?: number[];
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status?: DeviceAttributes["status"];
	q?: string;
	metadata?: Record<string, string | number | boolean>;
}
