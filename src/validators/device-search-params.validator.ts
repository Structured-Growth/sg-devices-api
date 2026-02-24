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
			serialNumber: joi
				.alternatives()
				.try(joi.array().items(joi.string().max(100)), joi.string().max(100))
				.label("validator.devices.serialNumber"),
			imei: joi.string().max(50).label("validator.devices.imei"),
			status: joi.string().valid("active", "inactive", "archived"),
			q: joi.string().min(1).max(200).label("validator.devices.q"),
			metadata: joi.string().max(2000).label("validator.devices.metadata"),
		})
		.concat(CommonSearchParamsValidator),
});
