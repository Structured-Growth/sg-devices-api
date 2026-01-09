export type CsvColumnType =
	| { type: "string"; required?: boolean; maxLength?: number }
	| { type: "number"; required?: boolean; integer?: boolean }
	| { type: "date"; required?: boolean };

export type CsvTypesMap = Record<string, CsvColumnType>;

export interface CsvDefaults {
	deviceCategoryId: number;
	deviceTypeId: number;
	manufacturer?: string;
	modelNumber?: string;
	imei?: string;
	status: "active" | "inactive";
}
