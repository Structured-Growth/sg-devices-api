import { joi } from "@structured-growth/microservice-sdk";

export const DeviceCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.devices.orgId"),
		region: joi.string().required().min(2).max(10).label("validator.devices.region"),
		accountId: joi.number().positive().allow(null).label("validator.devices.accountId"),
		userId: joi.number().positive().allow(null).label("validator.devices.userId"),
		deviceCategoryId: joi.number().positive().required().label("validator.devices.deviceCategoryId"),
		deviceTypeId: joi.number().positive().required().label("validator.devices.deviceTypeId"),
		manufacturer: joi.string().max(50).label("validator.devices.manufacturer"),
		modelNumber: joi.string().max(50).label("validator.devices.modelNumber"),
		serialNumber: joi.string().max(100).label("validator.devices.serialNumber"),
		imei: joi.string().max(50).label("validator.devices.imei"),
		status: joi.string().required().valid("active", "inactive", "archived"),
		metadata: joi
			.object()
			.max(10)
			.pattern(
				/^/,
				joi
					.alternatives()
					.try(joi.boolean(), joi.number(), joi.string().max(255), joi.string().isoDate())
					.allow("", null)
			),
	}),
});
