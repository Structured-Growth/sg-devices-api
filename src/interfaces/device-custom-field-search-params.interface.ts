import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { DeviceCustomFieldAttributes } from "../../database/models/device-custom-field";

export interface DeviceCustomFieldSearchParamsInterface
	extends Omit<DefaultSearchParamsInterface, "orgId" | "accountId"> {
	orgId: number;
	accountId?: number;
	entity?: string[];
	status?: DeviceCustomFieldAttributes["status"][];
	title?: string[];
	name?: string[];
	includeInherited?: boolean;
}
