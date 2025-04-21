import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const DeviceSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().label("validator.devices.orgId"),
			accountId: joi.number().positive().label("validator.devices.accountId"),
			userId: joi.number().positive().label("validator.devices.userId"),
			deviceCategoryId: joi.number().positive().label("validator.devices.deviceCategoryId"),
			deviceTypeId: joi.array().items(joi.number().positive()).label("validator.devices.deviceTypeId"),
			manufacturer: joi.string().max(50).label("validator.devices.manufacturer"),
			modelNumber: joi.string().max(50).label("validator.devices.modelNumber"),
			serialNumber: joi.string().max(100).label("validator.devices.orgId"),
			imei: joi.string().max(50).label("validator.devices.serialNumber"),
			status: joi.string().valid("active", "inactive", "archived"),
		})
		.concat(CommonSearchParamsValidator),
});
