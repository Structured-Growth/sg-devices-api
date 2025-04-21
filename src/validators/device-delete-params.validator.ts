import { joi } from "@structured-growth/microservice-sdk";

export const DeviceDeleteParamsValidator = joi.object({
	deviceId: joi.number().positive().required().label("validator.devices.deviceId"),
});
