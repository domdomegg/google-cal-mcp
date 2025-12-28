import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';
import {strictSchemaWithAliases} from '../utils/schema.js';

const inputSchema = strictSchemaWithAliases({
	minAccessRole: z.enum(['freeBusyReader', 'reader', 'writer', 'owner']).optional().describe('Minimum access role for calendars to return'),
	showDeleted: z.boolean().default(false).describe('Include deleted calendars'),
	showHidden: z.boolean().default(false).describe('Include hidden calendars'),
}, {});

export function registerCalendarsList(server: McpServer, config: Config): void {
	server.registerTool(
		'calendars_list',
		{
			title: 'List calendars',
			description: 'List all calendars the user has access to',
			inputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({minAccessRole, showDeleted, showHidden}) => {
			const params = new URLSearchParams();
			if (minAccessRole) {
				params.set('minAccessRole', minAccessRole);
			}

			if (showDeleted) {
				params.set('showDeleted', 'true');
			}

			if (showHidden) {
				params.set('showHidden', 'true');
			}

			const result = await makeCalendarApiCall('GET', `/users/me/calendarList?${params.toString()}`, config.token);
			return jsonResult(result);
		},
	);
}
