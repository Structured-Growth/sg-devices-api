import { joi } from "@structured-growth/microservice-sdk";

export const DeviceCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		region: joi.string().required().min(2).max(10).label("Region"),
		accountId: joi.number().positive().required().label("Account Id"),
		userId: joi.number().positive().required().label("User Id"),
		deviceCategoryId: joi.number().positive().required().label("Device category Id"),
		deviceTypeId: joi.number().positive().required().label("Device type Id"),
		manufacturer: joi.string().max(50).label("Manufacturer"),
		modelNumber: joi.string().max(50).label("Model number"),
		serialNumber: joi.string().max(100).label("Serial number"),
		imei: joi.string().max(50).label("IMEI"),
		status: joi.string().required().valid("active", "inactive", "archived"),
	}),
});
