import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const DeviceCustomFieldSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().required().label("validator.deviceCustomFields.orgId"),
			entity: joi.array().items(joi.string().max(255)).label("validator.deviceCustomFields.entity"),
			status: joi
				.array()
				.items(joi.string().valid("active", "inactive", "archived"))
				.label("validator.deviceCustomFields.status"),
			title: joi.array().items(joi.string().max(255)).label("validator.deviceCustomFields.title"),
			name: joi.array().items(joi.string().max(255)).label("validator.deviceCustomFields.name"),
			includeInherited: joi.boolean().label("validator.deviceCustomFields.includeInherited"),
		})
		.concat(CommonSearchParamsValidator),
});
