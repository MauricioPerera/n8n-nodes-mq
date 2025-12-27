import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

import { run, format, diagnostics, toAst, MqRunOptions } from './MqEngine';

export class Mq implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MQ (Markdown Query)',
		name: 'mq',
		icon: 'file:mq.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Process Markdown using mq query language - filter, transform and extract data like jq for JSON',
		defaults: {
			name: 'MQ',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Query', value: 'query', description: 'Run an mq query on Markdown content', action: 'Run mq query' },
					{ name: 'Extract Sections', value: 'extractSections', description: 'Extract matching sections as separate items', action: 'Extract sections' },
					{ name: 'Format Query', value: 'format', description: 'Format an mq query string', action: 'Format mq query' },
					{ name: 'Validate Query', value: 'validate', description: 'Check if an mq query is valid', action: 'Validate mq query' },
				],
				default: 'query',
			},
			{
				displayName: 'Markdown Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 10 },
				default: '',
				required: true,
				description: 'The Markdown content to process',
				displayOptions: { show: { operation: ['query', 'extractSections'] } },
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '.h',
				required: true,
				description: 'The mq query. Examples: .h (headers), .h2, .code, .blockquote.',
				displayOptions: { show: { operation: ['query', 'extractSections', 'format', 'validate'] } },
			},
			{
				displayName: 'Input Format',
				name: 'inputFormat',
				type: 'options',
				options: [
					{ name: 'Markdown', value: 'markdown' },
					{ name: 'MDX', value: 'mdx' },
					{ name: 'HTML', value: 'html' },
				],
				default: 'markdown',
				displayOptions: { show: { operation: ['query', 'extractSections'] } },
			},
			{
				displayName: 'Split By',
				name: 'splitBy',
				type: 'options',
				options: [
					{ name: 'Line Breaks', value: 'lines' },
					{ name: 'Single Items', value: 'single' },
				],
				default: 'lines',
				displayOptions: { show: { operation: ['extractSections'] } },
			},
			{
				displayName: 'Output Field',
				name: 'outputField',
				type: 'string',
				default: 'result',
				displayOptions: { show: { operation: ['query', 'format'] } },
			},
			{
				displayName: 'Include Original',
				name: 'includeOriginal',
				type: 'boolean',
				default: false,
				displayOptions: { show: { operation: ['query', 'extractSections'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let result: IDataObject = {};

				switch (operation) {
					case 'query': {
						const content = this.getNodeParameter('content', i) as string;
						const query = this.getNodeParameter('query', i) as string;
						const inputFormat = this.getNodeParameter('inputFormat', i) as MqRunOptions['inputFormat'];
						const outputField = this.getNodeParameter('outputField', i) as string;
						const includeOriginal = this.getNodeParameter('includeOriginal', i) as boolean;

						const queryResult = await run(query, content, { inputFormat });

						result = { success: true, [outputField]: queryResult, query };
						if (includeOriginal) result.original = content;
						break;
					}

					case 'extractSections': {
						const content = this.getNodeParameter('content', i) as string;
						const query = this.getNodeParameter('query', i) as string;
						const inputFormat = this.getNodeParameter('inputFormat', i) as MqRunOptions['inputFormat'];
						const splitBy = this.getNodeParameter('splitBy', i) as string;
						const includeOriginal = this.getNodeParameter('includeOriginal', i) as boolean;

						const queryResult = await run(query, content, { inputFormat });
						let sections: string[];
						if (splitBy === "lines") {
							sections = queryResult.split("\n\n").map(s => s.trim()).filter(s => s.length > 0);
						} else {
							sections = queryResult.split("\n").map(s => s.trim()).filter(s => s.length > 0);
						}

						for (let j = 0; j < sections.length; j++) {
							const sectionResult: IDataObject = {
								success: true, section: sections[j], index: j, total: sections.length, query,
							};
							if (includeOriginal) sectionResult.original = content;
							returnData.push({ json: sectionResult, pairedItem: { item: i } });
						}
						continue;
					}

					case 'format': {
						const query = this.getNodeParameter('query', i) as string;
						const outputField = this.getNodeParameter('outputField', i) as string;
						const formatted = await format(query);
						result = { success: true, [outputField]: formatted, original: query };
						break;
					}

					case 'validate': {
						const query = this.getNodeParameter('query', i) as string;
						const diags = await diagnostics(query);
						const isValid = diags.length === 0;
						let ast: string | undefined;
						if (isValid) { try { ast = await toAst(query); } catch { /* AST generation failed, continue without it */ } }
						result = { success: true, valid: isValid, query, diagnostics: diags, ...(ast && { ast }) };
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), 'Unknown operation: ' + operation);
				}

				returnData.push({ json: result, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { success: false, error: error instanceof Error ? error.message : String(error) }, pairedItem: { item: i } });
				} else { throw error; }
			}
		}
		return [returnData];
	}
}
