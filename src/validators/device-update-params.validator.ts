import { joi } from "@structured-growth/microservice-sdk";

export const DeviceUpdateParamsValidator = joi.object({
	deviceId: joi.number().positive().required().label("validator.devices.deviceId"),
	query: joi.object(),
	body: joi.object({
		accountId: joi.number().positive().label("validator.devices.accountId"),
		userId: joi.number().positive().label("validator.devices.userId"),
		deviceCategoryId: joi.number().positive().label("validator.devices.deviceCategoryId"),
		deviceTypeId: joi.number().positive().label("validator.devices.deviceTypeId"),
		manufacturer: joi.string().max(50).label("validator.devices.manufacturer"),
		modelNumber: joi.string().max(50).label("validator.devices.modelNumber"),
		serialNumber: joi.string().max(100).label("validator.devices.serialNumber"),
		imei: joi.string().max(50).label("validator.devices.imei"),
		status: joi.string().valid("active", "inactive", "archived"),
	}),
});
