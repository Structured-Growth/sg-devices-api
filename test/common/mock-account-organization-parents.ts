const originalFetch = global.fetch.bind(global);

export function installAccountOrganizationParentsMock(): void {
	global.fetch = (async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
		const accountApiUrl = process.env.ACCOUNT_API_URL || "";
		const parentsPattern = new RegExp(`^${accountApiUrl.replace(/[.*+?^${}()|[\]\\\\]/g, "\\$&")}/v1/organizations/\\d+/parents$`);

		if (accountApiUrl && parentsPattern.test(url)) {
			return new Response(JSON.stringify([]), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		return originalFetch(input as any, init);
	}) as typeof global.fetch;
}

export function restoreAccountOrganizationParentsMock(): void {
	global.fetch = originalFetch;
}
