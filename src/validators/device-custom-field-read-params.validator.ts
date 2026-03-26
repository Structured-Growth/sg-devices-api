import { joi } from "@structured-growth/microservice-sdk";

export const DeviceCustomFieldReadParamsValidator = joi.object({
	deviceCustomFieldId: joi.number().positive().required().label("validator.deviceCustomFields.deviceCustomFieldId"),
});
