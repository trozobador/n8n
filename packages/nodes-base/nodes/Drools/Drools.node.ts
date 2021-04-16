import {
    IExecuteFunctions,
} from 'n8n-core';

import {
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import {
    OptionsWithUri,
} from 'request';

export class FriendGrid implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Drools Decision Table',
        name: 'droolsdecisiontable',
        icon: 'file:drools.ico',
        group: ['transform'],
        version: 1,
        description: 'Consome uma tabela de Decisão do Drools',
        defaults: {
            name: 'Drools Decision Table',
            color: '#1A82e2',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
        ],
        properties: [
            {
                displayName: 'Drools URL',
                name: 'resource',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'create',
                        ],
                        resource: [
                            'rule',
                        ],
                    },
                },
                default: 'URL',
                description: 'Resource to consume',
            },
            {
                displayName: 'Drools Project',
                name: 'project',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'create',
                        ],
                        resource: [
                            'rule',
                        ],
                    },
                },
                default: 'create',
                description: 'Project of Rule',
            },
            {
                displayName: 'Rule Name',
                name: 'rulename',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'create',
                        ],
                        resource: [
                            'rule',
                        ],
                    },
                },
                default:'',
                description:'Name of rule',
            },        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        return [[]];
    }
}