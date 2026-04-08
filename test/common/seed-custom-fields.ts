import { joi, RegionEnum } from "@structured-growth/microservice-sdk";
import CustomField from "../../database/models/custom-field";

export async function seedCustomFields(orgId: number): Promise<void> {
	const fields = [
		{ name: "a", title: "A", schema: joi.number().describe() },
		{ name: "b", title: "B", schema: joi.number().describe() },
		{ name: "productSerialNumber", title: "Product Serial Number", schema: joi.string().describe() },
		{ name: "calCode", title: "Calibration Code", schema: joi.string().describe() },
		{ name: "foo", title: "Foo", schema: joi.string().describe() },
	];

	for (const field of fields) {
		await CustomField.create({
			orgId,
			region: RegionEnum.US,
			entity: "Device",
			title: field.title,
			name: field.name,
			schema: field.schema,
			status: "active",
		});
	}
}
