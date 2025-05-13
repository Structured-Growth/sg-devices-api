import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import * as fs from "fs";
import * as path from "path";
import * as FormData from "form-data";

describe("POST /api/v1/devices/upload", () => {
	const { server } = initTest();

	it("Should import devices from valid CSV", async () => {
		const csvPath = path.resolve(__dirname, "./csv-mock/device_bulk_create_sample.csv");

		const response = await server
			.post("/v1/devices/upload")
			.attach("file", fs.createReadStream(csvPath), "devices-valid.csv");

		assert.equal(response.statusCode, 201);
		assert.isTrue(response.body.success);
		assert.isNumber(response.body.created);
		assert.isAbove(response.body.created, 0);
	});

	it("Should fail on invalid CSV data", async () => {
		const csvPath = path.resolve(__dirname, "./csv-mock/device_bulk_create_invalid_sample.csv");

		const response = await server
			.post("/v1/devices/upload")
			.attach("file", fs.createReadStream(csvPath), "devices-invalid.csv");

		assert.equal(response.statusCode, 422);
		assert.equal(response.body.name, "ValidationError");
		assert.include(response.body.message, "CSV validation failed");
	});

	it("Should return error if no file is sent", async () => {
		const response = await server.post("/v1/devices/upload").send();

		assert.equal(response.statusCode, 422);
		assert.equal(response.body.name, "ValidationError");
		assert.include(response.body.message, "CSV file is required");
	});

	it("Should return error for non-CSV file", async () => {
		const form = new FormData();
		form.append("file", Buffer.from("not csv content"), {
			filename: "not-a-csv.txt",
			contentType: "text/plain",
		});

		const response = await server.post("/v1/devices/upload").set(form.getHeaders()).send(form.getBuffer());

		assert.equal(response.statusCode, 422);
		assert.equal(response.body.name, "ValidationError");
		assert.include(response.body.message, "Invalid file type");
	});
});
