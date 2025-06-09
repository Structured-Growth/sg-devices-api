import { RegionEnum } from "@structured-growth/microservice-sdk";
import { DeviceCategoryIdEnum, DeviceTypeIdEnum } from "../../database/models/device";

export interface DeviceCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	accountId?: number;
	userId?: number;
	/**
	 * 1 - MEDICAL DEVICES
	 */
	deviceCategoryId: number;
	/**
	 * 1 - PULSE<br />
	 * 2 - BLOOD_PRESSURE<br />
	 * 3 - WEIGHT<br />
	 * 4 - BODY_SCALE<br />
	 * 5 - GLUCOSE_METER<br />
	 */
	deviceTypeId: number;
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status: "active" | "inactive";
	/**
	 * Custom metadata could be added to a metric
	 */
	metadata?: Record<string, string | number>;
}
