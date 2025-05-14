import { joi } from "@structured-growth/microservice-sdk";

export const DeviceBulkCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi
		.array()
		.items(
			joi.object({
				orgId: joi.number().positive().required().label("validator.devices.orgId"),
				region: joi.string().required().min(2).max(10).label("validator.devices.region"),
				accountId: joi.number().positive().label("validator.devices.accountId"),
				userId: joi.number().positive().label("validator.devices.userId"),
				deviceCategoryId: joi.number().positive().required().label("validator.devices.deviceCategoryId"),
				deviceTypeId: joi.number().positive().required().label("validator.devices.deviceTypeId"),
				manufacturer: joi.string().max(50).label("validator.devices.manufacturer"),
				modelNumber: joi.string().max(50).label("validator.devices.modelNumber"),
				serialNumber: joi.string().max(100).label("validator.devices.serialNumber"),
				imei: joi.string().max(50).label("validator.devices.imei"),
				status: joi.string().required().valid("active", "inactive"),
			})
		)
		.min(1)
		.required()
		.label("validator.devices.devices"),
});
