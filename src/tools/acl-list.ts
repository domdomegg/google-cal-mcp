import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

const inputSchema = {
	calendarId: z.string().describe('Calendar ID to get sharing rules for'),
	maxResults: z.number().min(1).max(250).default(100).describe('Maximum rules to return'),
	pageToken: z.string().optional().describe('Page token for pagination'),
	showDeleted: z.boolean().default(false).describe('Include deleted rules'),
};

export function registerAclList(server: McpServer, config: Config): void {
	server.registerTool(
		'acl_list',
		{
			title: 'List calendar sharing rules',
			description: 'List who has access to a calendar and their permission levels.',
			inputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({calendarId, maxResults, pageToken, showDeleted}) => {
			const params = new URLSearchParams();
			params.set('maxResults', String(maxResults));
			if (pageToken) {
				params.set('pageToken', pageToken);
			}

			if (showDeleted) {
				params.set('showDeleted', 'true');
			}

			const result = await makeCalendarApiCall(
				'GET',
				`/calendars/${encodeURIComponent(calendarId)}/acl?${params.toString()}`,
				config.token,
			);
			return jsonResult(result);
		},
	);
}
