import { joi } from "@structured-growth/microservice-sdk";

export const DeviceGetProductSNParamsValidator = joi.object({
	query: joi.object({
		serialNumber: joi.array().items(joi.string().max(100)).min(1).required().label("validator.devices.serialNumber"),
	}),
});
