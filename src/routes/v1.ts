/**
* IMPORTANT NOTE!
* This file was auto-generated with tsoa.
* Please do not modify it. Re-run tsoa to re-generate this file
*/

import { Router } from "express";
import { container, handleRequest } from "@structured-growth/microservice-sdk";
import * as Controllers from "../controllers/v1";

const handlerOpts = {
    logRequestBody: container.resolve<boolean>('logRequestBody'),
    logResponses: container.resolve<boolean>('logResponses'),
}

export const router = Router();
const pathPrefix = process.env.URI_PATH_PREFIX || '';

//SystemController
router.post(pathPrefix + '/v1/system/migrate', handleRequest(Controllers.SystemController, "migrate", handlerOpts));
router.post(pathPrefix + '/v1/system/i18n-upload', handleRequest(Controllers.SystemController, "uploadI18n", handlerOpts));

//PingController
router.get(pathPrefix + '/v1/ping/alive', handleRequest(Controllers.PingController, "pingGet", handlerOpts));

//DevicesController
router.get(pathPrefix + '/v1/devices', handleRequest(Controllers.DevicesController, "search", handlerOpts));
router.get(pathPrefix + '/v1/devices/get-product-sn', handleRequest(Controllers.DevicesController, "getProductSN", handlerOpts));
router.post(pathPrefix + '/v1/devices', handleRequest(Controllers.DevicesController, "create", handlerOpts));
router.post(pathPrefix + '/v1/devices/bulk', handleRequest(Controllers.DevicesController, "bulk", handlerOpts));
router.post(pathPrefix + '/v1/devices/upload', handleRequest(Controllers.DevicesController, "uploadCsv", handlerOpts));
router.get(pathPrefix + '/v1/devices/csv-template', handleRequest(Controllers.DevicesController, "downloadCsvTemplate", handlerOpts));
router.get(pathPrefix + '/v1/devices/:deviceId', handleRequest(Controllers.DevicesController, "get", handlerOpts));
router.put(pathPrefix + '/v1/devices/:deviceId', handleRequest(Controllers.DevicesController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/devices/:deviceId', handleRequest(Controllers.DevicesController, "delete", handlerOpts));

//DeviceCustomFieldsController
router.get(pathPrefix + '/v1/device-custom-fields', handleRequest(Controllers.DeviceCustomFieldsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/device-custom-fields', handleRequest(Controllers.DeviceCustomFieldsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/device-custom-fields/:deviceCustomFieldId', handleRequest(Controllers.DeviceCustomFieldsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/device-custom-fields/:deviceCustomFieldId', handleRequest(Controllers.DeviceCustomFieldsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/device-custom-fields/:deviceCustomFieldId', handleRequest(Controllers.DeviceCustomFieldsController, "delete", handlerOpts));

//DocsController
router.get(pathPrefix + '/v1/docs/swagger.json', handleRequest(Controllers.DocsController, "getSwagger", handlerOpts));

//ResolverController
router.get(pathPrefix + '/v1/resolver/resolve', handleRequest(Controllers.ResolverController, "resolve", handlerOpts));
router.get(pathPrefix + '/v1/resolver/actions', handleRequest(Controllers.ResolverController, "actions", handlerOpts));
router.get(pathPrefix + '/v1/resolver/models', handleRequest(Controllers.ResolverController, "models", handlerOpts));
router.post(pathPrefix + '/v1/resolver/validate', handleRequest(Controllers.ResolverController, "validateCustomFields", handlerOpts));

// map is required for correct resolving action by route
export const actionToRouteMap = {
	"SystemController.migrate": 'post /v1/system/migrate',
	"SystemController.uploadI18n": 'post /v1/system/i18n-upload',
	"PingController.pingGet": 'get /v1/ping/alive',
	"DevicesController.search": 'get /v1/devices',
	"DevicesController.getProductSN": 'get /v1/devices/get-product-sn',
	"DevicesController.create": 'post /v1/devices',
	"DevicesController.bulk": 'post /v1/devices/bulk',
	"DevicesController.uploadCsv": 'post /v1/devices/upload',
	"DevicesController.downloadCsvTemplate": 'get /v1/devices/csv-template',
	"DevicesController.get": 'get /v1/devices/:deviceId',
	"DevicesController.update": 'put /v1/devices/:deviceId',
	"DevicesController.delete": 'delete /v1/devices/:deviceId',
	"DeviceCustomFieldsController.search": 'get /v1/device-custom-fields',
	"DeviceCustomFieldsController.create": 'post /v1/device-custom-fields',
	"DeviceCustomFieldsController.get": 'get /v1/device-custom-fields/:deviceCustomFieldId',
	"DeviceCustomFieldsController.update": 'put /v1/device-custom-fields/:deviceCustomFieldId',
	"DeviceCustomFieldsController.delete": 'delete /v1/device-custom-fields/:deviceCustomFieldId',
	"DocsController.getSwagger": 'get /v1/docs/swagger.json',
	"ResolverController.resolve": 'get /v1/resolver/resolve',
	"ResolverController.actions": 'get /v1/resolver/actions',
	"ResolverController.models": 'get /v1/resolver/models',
	"ResolverController.validateCustomFields": 'post /v1/resolver/validate',
};
