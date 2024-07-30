import { DeviceAttributes } from "../../database/models/device";

export interface DeviceUpdateBodyInterface {
	manufacturer?: string;
	modelNumber?: string;
	serialNumber?: string;
	imei?: string;
	status?: DeviceAttributes["status"];
}
