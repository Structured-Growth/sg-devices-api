import { joi } from "@structured-growth/microservice-sdk";

export const DeviceBulkCreateValidator = joi
	.array()
	.items(
		joi.object({
			orgId: joi.number().positive().required().label("validator.devices.orgId"),
			region: joi.string().min(2).max(10).required().label("validator.devices.region"),
			accountId: joi.number().positive().optional().label("validator.devices.accountId"),
			userId: joi.number().positive().optional().label("validator.devices.userId"),
			deviceCategoryId: joi.number().positive().required().label("validator.devices.deviceCategoryId"),
			deviceTypeId: joi.number().positive().required().label("validator.devices.deviceTypeId"),
			manufacturer: joi.string().max(50).optional().label("validator.devices.manufacturer"),
			modelNumber: joi.string().max(50).optional().label("validator.devices.modelNumber"),
			serialNumber: joi.string().max(100).optional().label("validator.devices.serialNumber"),
			imei: joi.string().max(50).optional().label("validator.devices.imei"),
			status: joi.string().valid("active", "inactive", "archived").required().label("validator.devices.status"),
		})
	)
	.min(1)
	.required()
	.label("validator.devices.devices");
