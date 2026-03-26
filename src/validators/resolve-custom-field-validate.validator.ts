import { joi } from "@structured-growth/microservice-sdk";

export const ResolveCustomFieldValidateValidator = joi.object({
	body: joi.object({
		entity: joi.string().required().label("validator.deviceCustomFields.entity"),
		orgId: joi.number().positive().required().label("validator.deviceCustomFields.orgId"),
		data: joi.object().required().label("validator.devices.metadata"),
	}),
	query: joi.object(),
});
