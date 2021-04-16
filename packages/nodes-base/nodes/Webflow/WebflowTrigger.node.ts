import {
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-core';

import {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

import {
	webflowApiRequest,
} from './GenericFunctions';

export class WebflowTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Webflow Trigger',
		name: 'webflowTrigger',
		icon: 'file:webflow.png',
		group: ['trigger'],
		version: 1,
		description: 'Handle Webflow events via webhooks',
		defaults: {
			name: 'Webflow Trigger',
			color: '#245bf8',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'webflowApi',
				required: true,
				displayOptions: {
					show: {
						authentication: [
							'accessToken',
						],
					},
				},
			},
			{
				name: 'webflowOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: [
							'oAuth2',
						],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
				description: 'Method of authentication.',
			},
			{
				displayName: 'Site',
				name: 'site',
				type: 'options',
				required: true,
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getSites',
				},
				description: 'Site that will trigger the events',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				options: [
					{
						name: 'Form submission',
						value: 'form_submission',
					},
					{
						name: 'Ecomm Inventory Changed',
						value: 'ecomm_inventory_changed',
					},
					{
						name: 'Ecomm New Order',
						value: 'ecomm_new_order',
					},
					{
						name: 'Ecomm Order Changed',
						value: 'ecomm_order_changed',
					},
					{
						name: 'Site Publish',
						value: 'site_publish',
					},
				],
				default: 'form_submission',
			},
		],
	};

	methods = {
		loadOptions: {
			// Get all the sites to display them to user so that he can
			// select them easily
			async getSites(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const sites = await webflowApiRequest.call(this, 'GET', '/sites');
				for (const site of sites) {
					const siteName = site.name;
					const siteId = site._id;
					returnData.push({
						name: siteName,
						value: siteId,
					});
				}
				return returnData;
			},
		},
	};

	// @ts-ignore
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const siteId = this.getNodeParameter('site') as string;
				if (webhookData.webhookId === undefined) {
					return false;
				}
				const endpoint = `/sites/${siteId}/webhooks/${webhookData.webhookId}`;
				try {
					await webflowApiRequest.call(this, 'GET', endpoint);
				} catch (error) {
					return false;
				}
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const siteId = this.getNodeParameter('site') as string;
				const event = this.getNodeParameter('event') as string;
				const endpoint = `/sites/${siteId}/webhooks`;
				const body: IDataObject = {
					site_id: siteId,
					triggerType: event,
					url: webhookUrl,

				};
				const { _id } = await webflowApiRequest.call(this, 'POST', endpoint, body);
				webhookData.webhookId = _id;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				let responseData;
				const webhookData = this.getWorkflowStaticData('node');
				const siteId = this.getNodeParameter('site') as string;
				const endpoint = `/sites/${siteId}/webhooks/${webhookData.webhookId}`;
				try {
					responseData = await webflowApiRequest.call(this, 'DELETE', endpoint);
				} catch(error) {
					return false;
				}
				if (!responseData.deleted) {
					return false;
				}
				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		return {
			workflowData: [
				this.helpers.returnJsonArray(req.body),
			],
		};
	}
}
