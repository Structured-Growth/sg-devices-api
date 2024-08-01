import { autoInjectable, inject } from "@structured-growth/microservice-sdk";
import { DevicesRepository } from "./devices.repository";

@autoInjectable()
export class DevicesService {
	constructor(@inject("DevicesRepository") private deviceRepository: DevicesRepository) {}
}
