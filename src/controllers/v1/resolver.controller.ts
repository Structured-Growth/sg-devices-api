import { Get, Route, Tags, Queries, SuccessResponse, OperationId, Post, Body } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	NotFoundError,
	ValidateFuncArgs,
	inject,
} from "@structured-growth/microservice-sdk";
import * as controllers from "./index";
import { ResolveQueryParamsInterface } from "../../interfaces/resolve-query-params.interface";
import { ResolveResourceResponseInterface } from "../../interfaces/resolve-resource-response.interface";
import { ResolveActionsResponseInterface } from "../../interfaces/resolve-actions-response.interface";
import { ResolveModelsResponseInterface } from "../../interfaces/resolve-models-response.interface";
import { ResolveCustomFieldValidateBodyInterface } from "../../interfaces/resolve-custom-field-validate-body.interface";
import { ResolveCustomFieldValidateResponseInterface } from "../../interfaces/resolve-custom-field-validate-response.interface";
import { ResolveCustomFieldValidateValidator } from "../../validators/resolve-custom-field-validate.validator";
import { DeviceCustomFieldService } from "../../modules/device-custom-fields/device-custom-field.service";

@Route("v1/resolver")
@Tags("ResolverController")
@autoInjectable()
export class ResolverController extends BaseController {
	constructor(@inject("DeviceCustomFieldService") private deviceCustomFieldService: DeviceCustomFieldService) {
		super();
	}

	/**
	 * Resolve resource's ARN
	 */
	@OperationId("Resolve resource")
	@Get("/resolve")
	@SuccessResponse(200, "Returns resolved resource")
	@DescribeAction("resolve/resource")
	async resolve(@Queries() query: ResolveQueryParamsInterface): Promise<ResolveResourceResponseInterface> {
		const { resource, ...filter } = query;
		const modelClass = this.app.models[resource];

		if (!modelClass) {
			throw new NotFoundError("Not found");
		}

		const model = await modelClass.findOne({
			where: filter,
			rejectOnEmpty: false,
		});

		if (!model) {
			throw new NotFoundError("Not found");
		}

		return {
			arn: model["arn"],
		};
	}

	/**
	 * List all microservice actions
	 */
	@OperationId("List actions")
	@Get("/actions")
	@SuccessResponse(200, "Returns actions")
	@DescribeAction("resolve/actions")
	async actions(): Promise<ResolveActionsResponseInterface> {
		const actions = [];
		const { actionToRouteMap } = require("../../routes/v1");
		for (let controller in controllers as any) {
			const prototype = Object.getPrototypeOf(controllers[controller].prototype);
			const methods = Object.getOwnPropertyNames(prototype);
			for (let method of methods) {
				const action = Reflect.getMetadata(`__action:${method}`, prototype);
				const route = actionToRouteMap[`${controller}.${method}`];
				if (action) {
					const resources =
						action.resources?.map(({ resource, arnPattern }) => {
							const modelClass = this.app.models[resource];
							arnPattern = arnPattern || modelClass?.["arnPattern"] || "external resource";
							return { resource, arnPattern };
						}) || [];
					actions.push({
						action: `${this.appPrefix}:${action.action}`,
						route,
						resources,
					});
				}
			}
		}

		return {
			data: actions,
		};
	}

	/**
	 * List all microservice models
	 */
	@OperationId("List models")
	@Get("/models")
	@SuccessResponse(200, "Returns models")
	@DescribeAction("resolve/models")
	async models(): Promise<ResolveModelsResponseInterface> {
		const models = [];
		for (let i in this.app.models) {
			models.push({
				resource: i,
				arnPattern: this.app.models[i]["arnPattern"],
			});
		}

		return {
			data: models,
		};
	}

	/**
	 * Validate custom field payload for entity.
	 */
	@OperationId("Validate custom fields")
	@Post("/validate")
	@SuccessResponse(200, "Returns validation result")
	@DescribeAction("resolve/validate")
	@ValidateFuncArgs(ResolveCustomFieldValidateValidator)
	async validateCustomFields(
		@Queries() query: {},
		@Body() body: ResolveCustomFieldValidateBodyInterface
	): Promise<ResolveCustomFieldValidateResponseInterface> {
		return this.deviceCustomFieldService.validate(body.entity, body.data, body.orgId, false);
	}
}
