import { waitAppIsReady } from "./wait-app-is-ready";
import { agent } from "supertest";
import { webServer, container } from "@structured-growth/microservice-sdk";
import { routes } from "../../src/routes";

export function initTest() {
	const server = agent(webServer(routes));
	const context: Record<any, any> = {};

	container.register("authenticationEnabled", { useValue: false });
	container.register("authorizationEnabled", { useValue: false });

	waitAppIsReady();

	return { server, context };
}
