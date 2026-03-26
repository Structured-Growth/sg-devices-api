import { joi } from "@structured-growth/microservice-sdk";

export const DeviceCustomFieldDeleteParamsValidator = joi.object({
	deviceCustomFieldId: joi.number().positive().required().label("validator.deviceCustomFields.deviceCustomFieldId"),
});
