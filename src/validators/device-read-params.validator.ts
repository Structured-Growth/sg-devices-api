import { joi } from "@structured-growth/microservice-sdk";

export const DeviceReadParamsValidator = joi.object({
	deviceId: joi.number().positive().required().label("Device Id"),
});
