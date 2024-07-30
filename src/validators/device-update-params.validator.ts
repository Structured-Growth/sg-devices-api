import { joi } from "@structured-growth/microservice-sdk";

export const DeviceUpdateParamsValidator = joi.object({
	deviceId: joi.number().positive().required().label("Device Id"),
	query: joi.object(),
	body: joi.object({
		manufacturer: joi.string().max(50).label("Manufacturer"),
		modelNumber: joi.string().max(50).label("Model number"),
		serialNumber: joi.string().max(100).label("Serial number"),
		imei: joi.string().max(50).label("IMEI"),
		status: joi.string().valid("active", "inactive", "archived"),
	}),
});
