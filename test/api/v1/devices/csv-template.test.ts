import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/devices/csv-template", () => {
	const { server } = initTest();

	it("Should return CSV template file", async () => {
		const res = await server.get("/v1/devices/csv-template");

		assert.equal(res.statusCode, 200);

		const contentType = res.headers["content-type"];
		const contentDisposition = res.headers["content-disposition"];

		assert.isString(contentType);
		assert.match(contentType, /text\/csv/i);

		assert.isString(contentDisposition);
		assert.match(contentDisposition, /attachment/i);
		assert.match(contentDisposition, /devices-import-template\.csv/i);

		const text =
			typeof res.text === "string"
				? res.text
				: Buffer.isBuffer(res.body)
				? res.body.toString("utf-8")
				: String(res.body ?? "");

		assert.isString(text);
		assert.isAbove(text.length, 0, "CSV response body should not be empty");
	});
});
