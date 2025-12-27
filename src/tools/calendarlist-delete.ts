import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {textResult} from '../utils/response.js';
import {strictSchemaWithAliases} from '../utils/schema.js';

const inputSchema = strictSchemaWithAliases({
	calendarId: z.string().describe('Calendar ID to unsubscribe from'),
}, {});

export function registerCalendarlistDelete(server: McpServer, config: Config): void {
	server.registerTool(
		'calendarlist_delete',
		{
			title: 'Unsubscribe from calendar',
			description: 'Remove a calendar from the user\'s calendar list. This unsubscribes from the calendar but does not delete it.',
			inputSchema,
		},
		async ({calendarId}) => {
			await makeCalendarApiCall(
				'DELETE',
				`/users/me/calendarList/${encodeURIComponent(calendarId)}`,
				config.token,
			);
			return textResult('Unsubscribed from calendar successfully');
		},
	);
}
