type ValidationPayload = {
	valid: boolean;
	message?: string;
	errors?: Record<string, unknown>;
};

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

const originalFetch = global.fetch.bind(global);

let payload: ValidationPayload = {
	valid: true,
};

export function installCustomFieldValidationMock(): void {
	const mockedFetch: typeof global.fetch = async (input: FetchInput, init?: FetchInit) => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
		const validationUrl = `${process.env.ACCOUNT_API_URL}/v1/custom-fields/validate`;

		if (url === validationUrl) {
			return new Response(JSON.stringify(payload), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		return originalFetch(input as any, init);
	};

	global.fetch = mockedFetch;
}

export function restoreCustomFieldValidationMock(): void {
	global.fetch = originalFetch;
	payload = {
		valid: true,
	};
}

export function setCustomFieldValidationPayload(nextPayload: ValidationPayload): void {
	payload = nextPayload;
}
