import { DeviceCustomFieldAttributes } from "../../database/models/device-custom-field";

export interface DeviceCustomFieldUpdateBodyInterface {
	entity?: string;
	title?: string;
	name?: string;
	schema?: Record<string, unknown>;
	status?: DeviceCustomFieldAttributes["status"];
}
