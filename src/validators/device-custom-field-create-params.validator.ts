import { joi } from "@structured-growth/microservice-sdk";

export const DeviceCustomFieldCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.deviceCustomFields.orgId"),
		region: joi.string().required().min(2).max(10).label("validator.deviceCustomFields.region"),
		entity: joi.string().required().max(255).label("validator.deviceCustomFields.entity"),
		title: joi.string().required().max(255).label("validator.deviceCustomFields.title"),
		name: joi.string().required().max(255).label("validator.deviceCustomFields.name"),
		schema: joi.object().required().label("validator.deviceCustomFields.schema"),
		status: joi.string().valid("active", "inactive").label("validator.deviceCustomFields.status"),
	}),
});
