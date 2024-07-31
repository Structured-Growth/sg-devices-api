import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const DeviceSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().label("Organization Id"),
			accountId: joi.number().positive().label("Account Id"),
			userId: joi.number().positive().label("User Id"),
			deviceCategoryId: joi.number().positive().label("Device category Id"),
			deviceTypeId: joi.number().positive().label("Device type Id"),
			manufacturer: joi.string().max(50).label("Manufacturer"),
			modelNumber: joi.string().max(50).label("Model number"),
			serialNumber: joi.string().max(100).label("Serial number"),
			imei: joi.string().max(50).label("IMEI"),
			status: joi.string().valid("active", "inactive", "archived"),
		})
		.concat(CommonSearchParamsValidator),
});
