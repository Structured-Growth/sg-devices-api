import { joi } from "@structured-growth/microservice-sdk";

export const DeviceCustomFieldUpdateParamsValidator = joi.object({
	deviceCustomFieldId: joi.number().positive().required().label("validator.deviceCustomFields.deviceCustomFieldId"),
	query: joi.object(),
	body: joi.object({
		entity: joi.string().max(255).label("validator.deviceCustomFields.entity"),
		title: joi.string().max(255).label("validator.deviceCustomFields.title"),
		name: joi.string().max(255).label("validator.deviceCustomFields.name"),
		schema: joi.object().label("validator.deviceCustomFields.schema"),
		status: joi.string().valid("active", "inactive", "archived").label("validator.deviceCustomFields.status"),
	}),
});
