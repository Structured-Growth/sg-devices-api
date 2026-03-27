import { joi } from "@structured-growth/microservice-sdk";

export const ResolveCustomFieldValidateValidator = joi.object({
	body: joi.object({
		entity: joi.string().required().label("validator.customFields.entity"),
		orgId: joi.number().positive().required().label("validator.customFields.orgId"),
		data: joi.object().required().label("validator.devices.metadata"),
	}),
	query: joi.object(),
});
