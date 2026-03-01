import { container, Logger, CacheService } from "@structured-growth/microservice-sdk";

export async function handlerCacheCleanerPolicyEvents(subject: string, message: any) {
	const logger = container.resolve<Logger>("Logger");
	const cacheService = container.resolve<CacheService>("CacheService");
	const appPrefix = container.resolve<string>("appPrefix");

	const action = message?.action;

	if (!action) {
		logger.warn({ subject, message }, "Policy event skipped: missing action");
		return;
	}

	// You can also do additional filtering at the Terraform DevOps level, namely through aws_cloudwatch_event_target
	switch (true) {
		default:
			logger.warn({ subject, action }, "Unknown policy event");
			return;
	}
}
