import { CsvColumnType } from "../interfaces/device-upload-csv.interface";

export const parseHeaders = (value?: string): string[] =>
	(value ?? "")
		.split(",")
		.map((h) => h.trim())
		.filter(Boolean);

export const parseJson = <T>(value?: string, fallback: T = {} as T): T => {
	if (!value) return fallback;
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
};

export const compareHeaders = (actual: string[], expected: string[]) => {
	const missing = expected.filter((h) => !actual.includes(h));
	const extra = actual.filter((h) => !expected.includes(h));
	const sameOrder = actual.length === expected.length && actual.every((h, i) => h === expected[i]);
	return { missing, extra, sameOrder };
};

export const isEmpty = (v: any): boolean => v === undefined || v === null || String(v).trim() === "";

export const asTrimmedString = (v: any): string => (v == null ? "" : String(v).trim());

export const isValidNumber = (s: string, integer?: boolean): boolean => {
	const n = Number(s);
	if (!Number.isFinite(n)) return false;
	if (integer && !Number.isInteger(n)) return false;
	return true;
};

export const isValidDate = (s: string): boolean => Number.isFinite(Date.parse(s));

export const validateCell = (value: any, rule: CsvColumnType): string | null => {
	const str = asTrimmedString(value);

	if (isEmpty(str)) return rule.required ? "is required" : null;

	switch (rule.type) {
		case "string":
			if (rule.maxLength != null && str.length > rule.maxLength) return `max length is ${rule.maxLength}`;
			return null;

		case "number":
			if (!isValidNumber(str, rule.integer)) return "must be a number";
			return null;

		case "date":
			if (!isValidDate(str)) return "must be a valid date";
			return null;
	}
};
